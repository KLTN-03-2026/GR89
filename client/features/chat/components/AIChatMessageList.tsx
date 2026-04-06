'use client'

import { forwardRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Bot } from 'lucide-react'
import DOMPurify from 'dompurify'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface AIChatMessageListProps {
  messages: { role: 'user' | 'assistant'; content: string }[]
  isTyping: boolean
}

const AIChatMessageList = forwardRef<HTMLDivElement, AIChatMessageListProps>(
  ({ messages, isTyping }, ref) => {
    const [submittedExercises, setSubmittedExercises] = useState<Set<string>>(new Set())

    const hasExerciseHtml = (content: string) =>
      typeof content === 'string' && content.includes('class="ai-exercise"')

    const sanitizeHtml = (html: string) => {
      if (!html) return ''

      let processed = html

      processed = processed.replace(
        /<a\s+href="([^"]+)"\s+class="lesson-link">([^<]+)<\/a>/g,
        (match, href: string, text: string) => {
          const isInternal = href.includes('localhost') || href.startsWith('/')
          const path = isInternal && !href.startsWith('http')
            ? href
            : (href.startsWith('http') ? new URL(href).pathname : href)

          return `<a href="${isInternal ? path : href}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 my-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm hover:shadow-md no-underline">${text}</a>`
        }
      )

      processed = processed.replace(/\n/g, '<br />')

      return DOMPurify.sanitize(processed, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'input', 'label', 'button'],
        ALLOWED_ATTR: ['href', 'class', 'target', 'rel', 'type', 'name', 'value', 'placeholder', 'style', 'id', 'for', 'checked', 'disabled', 'data-exercise-type', 'data-exercise-id', 'data-question-id', 'data-explanation', 'data-value', 'data-correct', 'data-answer'],
        ALLOW_DATA_ATTR: true
      })
    }

    const markdownComponents = useMemo(() => ({
      a: (props: { href?: string; className?: string }) => {
        const href = props.href
        const className = props.className

        if (className?.includes('lesson-link')) {
          return <a {...props} />
        }

        const isInternal = typeof href === 'string' && (href.startsWith('/') || href.includes('localhost'))
        return (
          <a
            {...props}
            href={href}
            target={isInternal ? undefined : '_blank'}
            rel={isInternal ? undefined : 'noopener noreferrer'}
            className="text-purple-700 hover:text-purple-800 underline underline-offset-2"
          />
        )
      },
    }), [])

    const gradeExercise = useCallback((exerciseId: string) => {
      const container = document.querySelector(`[data-exercise-id="${exerciseId}"]`) as HTMLElement
      if (!container) {
        console.error('Exercise container not found:', exerciseId)
        return
      }

      const exerciseType = container.getAttribute('data-exercise-type')
      const questions = container.querySelectorAll('[data-question-id]')
      const results: Array<{ questionId: string; isCorrect: boolean; userAnswer: string; correctAnswer: string; explanation: string }> = []
      let correctCount = 0
      let totalCount = 0

      questions.forEach((questionEl) => {
        const questionId = questionEl.getAttribute('data-question-id') || ''
        const explanation = questionEl.getAttribute('data-explanation') || 'Không có giải thích.'
        totalCount++

        if (exerciseType === 'multiple-choice') {
          const selectedOption = questionEl.querySelector('input[type="radio"]:checked') as HTMLInputElement
          const correctOption = questionEl.querySelector('[data-correct="true"]') as HTMLElement
          const correctValue = correctOption?.getAttribute('data-value') || ''

          let correctAnswerText = ''
          if (correctOption) {
            const correctLabel = correctOption.cloneNode(true) as HTMLElement
            const input = correctLabel.querySelector('input')
            if (input) input.remove()
            correctAnswerText = correctLabel.textContent?.trim() || correctValue
          } else {
            correctAnswerText = correctValue
          }

          let userAnswerText = 'Chưa chọn'
          let isCorrect = false

          if (selectedOption) {
            const selectedLabel = selectedOption.closest('label')
            if (selectedLabel) {
              const labelClone = selectedLabel.cloneNode(true) as HTMLElement
              const inputClone = labelClone.querySelector('input')
              if (inputClone) inputClone.remove()
              userAnswerText = labelClone.textContent?.trim() || selectedOption.value
            } else {
              userAnswerText = selectedOption.value
            }

            isCorrect = selectedOption.value === correctValue
          }

          if (isCorrect) correctCount++

          results.push({
            questionId,
            isCorrect,
            userAnswer: userAnswerText,
            correctAnswer: correctAnswerText,
            explanation
          })
        } else if (exerciseType === 'fill-blank' || exerciseType === 'translation') {
          const input = questionEl.querySelector('input[type="text"]') as HTMLInputElement
          const answerAttr = input?.getAttribute('data-answer') || ''
          const userAnswer = (input?.value || '').trim().toLowerCase()
          const correctAnswers = answerAttr.toLowerCase().split('|').map(a => a.trim()).filter(a => a.length > 0)

          const isCorrect = correctAnswers.length > 0 && correctAnswers.includes(userAnswer)
          if (isCorrect) correctCount++

          results.push({
            questionId,
            isCorrect,
            userAnswer: userAnswer || 'Chưa điền',
            correctAnswer: correctAnswers.join(' hoặc '),
            explanation
          })
        }
      })

      const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
      const resultDiv = container.querySelector(`.ai-exercise-result[data-exercise-id="${exerciseId}"]`) as HTMLElement

      if (!resultDiv) {
        console.error('Result div not found for exercise:', exerciseId)
        return
      }

      const resultColor = percentage >= 80
        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
        : percentage >= 50
          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
          : 'border-red-500 bg-red-50 dark:bg-red-900/20'

      const textColor = percentage >= 80
        ? 'text-green-800 dark:text-green-200'
        : percentage >= 50
          ? 'text-yellow-800 dark:text-yellow-200'
          : 'text-red-800 dark:text-red-200'

      let resultHTML = `
          <div class="p-3 rounded-lg border-2 ${resultColor}">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-bold ${textColor}">Kết quả</h4>
              <span class="text-base font-bold ${textColor}">${percentage}%</span>
            </div>
            <div class="text-xs ${textColor} mb-2">
              Bạn đã trả lời đúng <strong>${correctCount}/${totalCount}</strong> câu hỏi
            </div>
            <div class="space-y-1.5">
        `

      results.forEach((result) => {
        const icon = result.isCorrect ? '✓' : '✗'
        const itemColor = result.isCorrect
          ? 'text-green-700 dark:text-green-300'
          : 'text-red-700 dark:text-red-300'
        const bgColor = result.isCorrect
          ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
          : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'

        resultHTML += `
            <div class="p-2 rounded border ${bgColor}">
              <div class="flex items-start gap-2">
                <span class="text-xs font-bold ${itemColor} flex-shrink-0 mt-0.5">${icon}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-xs ${itemColor} mb-1">
                    <strong>Câu ${result.questionId}:</strong>
                  </div>
                  <div class="text-xs ${itemColor} mb-1">
                    <span class="opacity-75">Đáp án của bạn:</span> <strong>"${result.userAnswer}"</strong>
                  </div>
                  <div class="text-xs ${itemColor} mb-1.5">
                    <span class="opacity-75">Đáp án đúng:</span> <strong>"${result.correctAnswer}"</strong>
                  </div>
                  <div class="pt-1 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">${result.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          `
      })

      resultHTML += `
            </div>
          </div>
        `

      resultDiv.innerHTML = resultHTML
      resultDiv.style.display = 'block'

      if (exerciseType === 'multiple-choice') {
        questions.forEach((questionEl) => {
          const questionId = questionEl.getAttribute('data-question-id') || ''
          const result = results.find(r => r.questionId === questionId)

          if (result) {
            const correctOption = questionEl.querySelector('[data-correct="true"]') as HTMLElement
            if (correctOption) {
              correctOption.style.borderColor = '#10b981'
              correctOption.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'
            }

            if (!result.isCorrect) {
              const selectedOption = questionEl.querySelector('input[type="radio"]:checked')
              if (selectedOption) {
                const selectedLabel = selectedOption.closest('label') as HTMLElement
                if (selectedLabel && selectedLabel !== correctOption) {
                  selectedLabel.style.borderColor = '#ef4444'
                  selectedLabel.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                }
              }
            }
          }
        })
      }

      if (exerciseType === 'fill-blank' || exerciseType === 'translation') {
        questions.forEach((questionEl) => {
          const questionId = questionEl.getAttribute('data-question-id') || ''
          const result = results.find(r => r.questionId === questionId)
          const input = questionEl.querySelector('input[type="text"]') as HTMLInputElement

          if (input && result) {
            if (result.isCorrect) {
              input.style.borderColor = '#10b981'
              input.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'
            } else {
              input.style.borderColor = '#ef4444'
              input.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
            }
          }
        })
      }

      container.querySelectorAll('input, button').forEach((el) => {
        (el as HTMLElement).setAttribute('disabled', 'true')
      })

      const submitBtn = container.querySelector(`.ai-exercise-submit[data-exercise-id="${exerciseId}"]`) as HTMLButtonElement
      if (submitBtn) {
        submitBtn.disabled = true
        submitBtn.textContent = '✓ Đã nộp'
        submitBtn.classList.add('opacity-60', 'cursor-not-allowed')
      }

      setSubmittedExercises((prev: Set<string>) => new Set(prev).add(exerciseId))
    }, [])

    useEffect(() => {
      const handleSubmitClick = (e: Event) => {
        const target = e.target as HTMLElement
        const submitButton = target.closest('.ai-exercise-submit') as HTMLButtonElement
        if (submitButton && !submitButton.disabled) {
          e.preventDefault()
          e.stopPropagation()
          const exerciseId = submitButton.getAttribute('data-exercise-id')
          if (exerciseId && !submittedExercises.has(exerciseId)) {
            gradeExercise(exerciseId)
          }
        }
      }

      document.addEventListener('click', handleSubmitClick, true)

      return () => {
        document.removeEventListener('click', handleSubmitClick, true)
      }
    }, [gradeExercise, submittedExercises])

    return (
      <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-2 dark:bg-gray-950 min-h-0">
        {messages.map((m, index) => (
          <div key={`${m.role}-${index}`} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[95%] ${m.role === 'user' ? 'order-2' : 'order-1'}`}>
              {m.role !== 'user' && (
                <div className="mb-0.5 flex items-center gap-1">
                  <Bot className="h-3 w-3 text-purple-600" />
                  <span className="text-[9px] font-medium text-gray-600 dark:text-gray-300">AI</span>
                </div>
              )}
              <div
                className={`rounded-xl px-2.5 py-1.5 break-words overflow-wrap-anywhere ${m.role === 'user'
                  ? 'rounded-tr-md bg-purple-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 shadow-sm'
                  }`}
              >
                {m.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere word-break-break-word">
                    {m.content}
                  </p>
                ) : (
                  <div
                    className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_.ai-exercise]:my-3 [&_.ai-exercise]:p-3 [&_.ai-exercise]:rounded-xl [&_.ai-exercise]:border [&_.ai-exercise]:border-gray-200 [&_.ai-exercise]:dark:border-gray-700 [&_.ai-exercise]:bg-white [&_.ai-exercise]:dark:bg-gray-800 [&_.ai-exercise]:shadow-sm [&_.ai-exercise-question]:mb-2.5 [&_.ai-exercise-question]:last:mb-0 [&_.ai-exercise-question]:p-3 [&_.ai-exercise-question]:rounded-lg [&_.ai-exercise-question]:border [&_.ai-exercise-question]:border-gray-100 [&_.ai-exercise-question]:dark:border-gray-800 [&_.ai-exercise-question]:bg-gradient-to-br [&_.ai-exercise-question]:from-gray-50 [&_.ai-exercise-question]:to-white [&_.ai-exercise-question]:dark:from-gray-900/50 [&_.ai-exercise-question]:dark:to-gray-800/30 [&_.ai-exercise-text]:text-sm [&_.ai-exercise-text]:font-medium [&_.ai-exercise-text]:text-gray-900 [&_.ai-exercise-text]:dark:text-gray-100 [&_.ai-exercise-text]:mb-1.5 [&_.ai-exercise-options]:space-y-1.5 [&_.ai-exercise-options]:mt-1.5 [&_.ai-exercise-option]:flex [&_.ai-exercise-option]:items-center [&_.ai-exercise-option]:gap-2.5 [&_.ai-exercise-option]:p-2 [&_.ai-exercise-option]:rounded-md [&_.ai-exercise-option]:border [&_.ai-exercise-option]:border-gray-200 [&_.ai-exercise-option]:dark:border-gray-700 [&_.ai-exercise-option]:bg-white [&_.ai-exercise-option]:dark:bg-gray-800 [&_.ai-exercise-option]:cursor-pointer [&_.ai-exercise-option]:transition-all [&_.ai-exercise-option]:hover:border-purple-400 [&_.ai-exercise-option]:hover:bg-purple-50/50 [&_.ai-exercise-option]:dark:hover:border-purple-600 [&_.ai-exercise-option]:dark:hover:bg-purple-900/20 [&_.ai-exercise-option_input:checked+span]:border-purple-500 [&_.ai-exercise-option_input:checked+span]:bg-purple-50 [&_.ai-exercise-option_input:checked+span]:dark:bg-purple-900/20 [&_.ai-exercise-input]:w-full [&_.ai-exercise-input]:px-3 [&_.ai-exercise-input]:py-2 [&_.ai-exercise-input]:text-sm [&_.ai-exercise-input]:border [&_.ai-exercise-input]:border-gray-300 [&_.ai-exercise-input]:dark:border-gray-600 [&_.ai-exercise-input]:rounded-md [&_.ai-exercise-input]:bg-white [&_.ai-exercise-input]:dark:bg-gray-800 [&_.ai-exercise-input]:focus:outline-none [&_.ai-exercise-input]:focus:border-purple-500 [&_.ai-exercise-input]:focus:ring-2 [&_.ai-exercise-input]:focus:ring-purple-500/20 [&_.ai-exercise-submit]:w-full [&_.ai-exercise-submit]:mt-3 [&_.ai-exercise-submit]:px-3 [&_.ai-exercise-submit]:py-2 [&_.ai-exercise-submit]:bg-gradient-to-r [&_.ai-exercise-submit]:from-purple-600 [&_.ai-exercise-submit]:to-purple-700 [&_.ai-exercise-submit]:hover:from-purple-700 [&_.ai-exercise-submit]:hover:to-purple-800 [&_.ai-exercise-submit]:text-white [&_.ai-exercise-submit]:text-sm [&_.ai-exercise-submit]:font-semibold [&_.ai-exercise-submit]:rounded-lg [&_.ai-exercise-submit]:transition-all [&_.ai-exercise-submit]:shadow-sm [&_.ai-exercise-submit]:hover:shadow-md [&_.ai-exercise-submit]:disabled:opacity-50 [&_.ai-exercise-submit]:disabled:cursor-not-allowed [&_.ai-exercise-result]:mt-3"
                  >
                    {hasExerciseHtml(m.content) ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(m.content),
                        }}
                      />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={markdownComponents}
                      >
                        {m.content}
                      </ReactMarkdown>
                    )}
                  </div>
                )}
              </div>
              <p className="ml-1 mt-0.5 text-[9px] text-gray-400 dark:text-gray-500">
                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-600" />
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500" style={{ animationDelay: '120ms' }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500" style={{ animationDelay: '240ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={ref} />
      </div>
    )
  }
)

AIChatMessageList.displayName = 'AIChatMessageList'

export default AIChatMessageList

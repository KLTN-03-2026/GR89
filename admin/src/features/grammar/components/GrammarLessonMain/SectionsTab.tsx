'use client'

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { updateGrammarSections } from '../../services/api'
import { toast } from 'react-toastify'

import { SectionEditorPanel } from './SectionEditorPanel'
import { SectionListPanel } from './SectionListPanel'
import type { GrammarLessonDraft, LessonSection, SectionBlockKey } from '../../types'
import {
  createId,
  getExamplesTextareaError,
  getFormulaTextareaError,
  getListTextareaError,
  getSingleTextareaError,
  getTableHeaderError,
  getTableRowsError,
  parseExamplesInput,
  parsePipeListInput,
  parseTableRowsInput,
  SECTION_BLOCK_OPTIONS,
  serializeTableRows
} from './utils'

interface SectionsTabProps {
  draft: GrammarLessonDraft
  setDraft: Dispatch<SetStateAction<GrammarLessonDraft>>
  activeSectionIndex: number
  setActiveSectionIndex: Dispatch<SetStateAction<number>>
  activeSection: LessonSection | null
}

export function SectionsTab({ draft, setDraft, activeSectionIndex, setActiveSectionIndex, activeSection }: SectionsTabProps) {
  const [sectionListInput, setSectionListInput] = useState('')
  const [sectionExamplesInput, setSectionExamplesInput] = useState('')
  const [sectionTableHeadersInput, setSectionTableHeadersInput] = useState('')
  const [sectionTableRowsInput, setSectionTableRowsInput] = useState('')
  const hasActiveSection = activeSection !== null
  const activeSectionList = activeSection?.list
  const activeSectionExamples = activeSection?.examples
  const activeSectionTable = activeSection?.table

  useEffect(() => {
    if (!hasActiveSection) {
      setSectionListInput('')
      setSectionExamplesInput('')
      setSectionTableHeadersInput('')
      setSectionTableRowsInput('')
      return
    }

    setSectionListInput((activeSectionList || []).join('\n'))
    setSectionExamplesInput((activeSectionExamples || []).map((example) => `${example.en} | ${example.vi || ''}`).join('\n'))
    setSectionTableHeadersInput((activeSectionTable?.headers || []).join(' | '))
    setSectionTableRowsInput(serializeTableRows(activeSectionTable?.rows || []))
  }, [activeSectionExamples, activeSectionIndex, activeSectionList, activeSectionTable, hasActiveSection])

  const activeSectionAvailableBlocks = useMemo(() => {
    if (!activeSection) return []

    return SECTION_BLOCK_OPTIONS.filter((block) => {
      if (block.key === 'description') return activeSection.description === undefined
      if (block.key === 'note') return activeSection.note === undefined
      if (block.key === 'formula') return activeSection.formula === undefined
      if (block.key === 'list') return activeSection.list === undefined
      if (block.key === 'examples') return activeSection.examples === undefined

      return activeSection.table === undefined
    })
  }, [activeSection])

  const tableHeaderCount = useMemo(() => parsePipeListInput(sectionTableHeadersInput).length, [sectionTableHeadersInput])

  const activeSectionErrors = useMemo(() => {
    if (!activeSection) {
      return {
        description: '',
        note: '',
        formula: '',
        list: '',
        examples: '',
        tableHeaders: '',
        tableRows: ''
      }
    }

    return {
      description: activeSection.description !== undefined ? getSingleTextareaError(activeSection.description || '', 'Mô tả') : '',
      note: activeSection.note !== undefined ? getSingleTextareaError(activeSection.note || '', 'Lưu ý') : '',
      formula: activeSection.formula !== undefined ? getFormulaTextareaError(activeSection.formula || '') : '',
      list: activeSection.list !== undefined ? getListTextareaError(sectionListInput) : '',
      examples: activeSection.examples !== undefined ? getExamplesTextareaError(sectionExamplesInput) : '',
      tableHeaders: activeSection.table !== undefined ? getTableHeaderError(sectionTableHeadersInput) : '',
      tableRows: activeSection.table !== undefined ? getTableRowsError(sectionTableRowsInput, tableHeaderCount) : ''
    }
  }, [activeSection, sectionExamplesInput, sectionListInput, sectionTableHeadersInput, sectionTableRowsInput, tableHeaderCount])

  const updateSection = (patch: Partial<LessonSection>) => {
    if (!activeSection) return

    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) => (index === activeSectionIndex ? { ...section, ...patch } : section))
    }))
  }

  const handleSaveSectionContent = async () => {
    if (!activeSection) return

    const hasSectionErrors = Object.values(activeSectionErrors).some(Boolean)
    if (hasSectionErrors) {
      toast.error('Vui lòng sửa các lỗi màu đỏ trước khi lưu')
      return
    }

    const patch: Partial<LessonSection> = {}

    if (activeSection.list !== undefined) {
      patch.list = sectionListInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    }

    if (activeSection.examples !== undefined) {
      patch.examples = parseExamplesInput(sectionExamplesInput).examples
    }

    if (activeSection.table !== undefined) {
      const headers = parsePipeListInput(sectionTableHeadersInput)
      const tableState = parseTableRowsInput(sectionTableRowsInput, headers.length)

      patch.table = {
        headers,
        rows: tableState.rows
      }
    }

    const normalizedSection = { ...activeSection, ...patch }
    const nextSections = draft.sections.map((section, index) => (index === activeSectionIndex ? normalizedSection : section))

    if (patch.list) setSectionListInput(patch.list.join('\n'))
    if (patch.examples) setSectionExamplesInput(patch.examples.map((example) => `${example.en} | ${example.vi || ''}`).join('\n'))
    if (patch.table) {
      setSectionTableHeadersInput(patch.table.headers.join(' | '))
      setSectionTableRowsInput(serializeTableRows(patch.table.rows))
    }

    const response = await updateGrammarSections(draft._id, nextSections)
    setDraft((prev) => ({
      ...prev,
      sections: response.data?.sections || nextSections
    }))

    toast.success('Đã lưu nội dung section')
  }

  const addSectionBlock = (blockKey: SectionBlockKey) => {
    if (!activeSection) return

    if (blockKey === 'description') updateSection({ description: '' })
    if (blockKey === 'note') updateSection({ note: '' })
    if (blockKey === 'formula') updateSection({ formula: '' })
    if (blockKey === 'list') updateSection({ list: [] })
    if (blockKey === 'examples') updateSection({ examples: [] })
    if (blockKey === 'table') updateSection({ table: { headers: [], rows: [] } })
  }

  const removeSectionBlock = (blockKey: SectionBlockKey) => {
    if (!activeSection) return

    if (blockKey === 'description') updateSection({ description: undefined })
    if (blockKey === 'note') updateSection({ note: undefined })
    if (blockKey === 'formula') updateSection({ formula: undefined })
    if (blockKey === 'list') updateSection({ list: undefined })
    if (blockKey === 'examples') updateSection({ examples: undefined })
    if (blockKey === 'table') updateSection({ table: undefined })
  }

  const handleMoveSectionUp = (index: number) => {
    if (index === 0) return

    setDraft((prev) => {
      const next = [...prev.sections]
        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return { ...prev, sections: next }
    })
  }

  const handleMoveSectionDown = (index: number) => {
    if (index === draft.sections.length - 1) return

    setDraft((prev) => {
      const next = [...prev.sections]
        ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
      return { ...prev, sections: next }
    })
  }

  const handleDeleteSection = (sectionIndex: number) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.filter((section, index) => index !== sectionIndex)
    }))

    if (activeSectionIndex === sectionIndex) setActiveSectionIndex(sectionIndex > 0 ? sectionIndex - 1 : 0)
    if (activeSectionIndex > sectionIndex) setActiveSectionIndex((prev) => prev - 1)
  }

  const handleAddSection = () => {
    const id = createId('section')
    setDraft((prev) => ({
      ...prev,
      sections: [...prev.sections, { id, title: 'Section mới' }]
    }))
    setActiveSectionIndex(draft.sections.length)
  }

  return (
    <TabsContent value="sections" className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <SectionListPanel
        sections={draft.sections}
        activeSectionIndex={activeSectionIndex}
        onSelectSection={setActiveSectionIndex}
        onMoveSectionUp={handleMoveSectionUp}
        onMoveSectionDown={handleMoveSectionDown}
        onDeleteSection={handleDeleteSection}
        onAddSection={handleAddSection}
      />

      <SectionEditorPanel
        activeSection={activeSection}
        availableBlocks={activeSectionAvailableBlocks}
        activeSectionErrors={activeSectionErrors}
        onSave={handleSaveSectionContent}
        onUpdateSection={updateSection}
        onAddBlock={addSectionBlock}
        onRemoveBlock={removeSectionBlock}
        sectionListInput={sectionListInput}
        setSectionListInput={setSectionListInput}
        sectionExamplesInput={sectionExamplesInput}
        setSectionExamplesInput={setSectionExamplesInput}
        sectionTableHeadersInput={sectionTableHeadersInput}
        setSectionTableHeadersInput={setSectionTableHeadersInput}
        sectionTableRowsInput={sectionTableRowsInput}
        setSectionTableRowsInput={setSectionTableRowsInput}
      />
    </TabsContent>
  )
}


const axios = require("axios");

const url = "https://docs.google.com/forms/d/e/1FAIpQLSeAEERHUoCHCcwtq4kSBak4lBLCV9xslrNzPwXFXRVWMwnfvA/formResponse"; // 🔥 thay link

// ===== RANDOM =====
function weightedRandom(options: any) {
  const total = options.reduce((sum: any, o: any) => sum + o.weight, 0);
  let r = Math.random() * total;

  for (let o of options) {
    if (r < o.weight) return o.value;
    r -= o.weight;
  }
}

function delay() {
  return new Promise(r => setTimeout(r, Math.random() * 4000 + 2000));
}

// ===== PAGE 1 =====
const lanDen = [
  { value: "Lần đầu", weight: 60 },
  { value: "2 - 3 lần", weight: 30 },
  { value: "Trên 3 lần", weight: 10 }
];

const mucDich = [
  { value: "Tham quan", weight: 30 },
  { value: "Thưởng thức ẩm thực", weight: 40 },
  { value: "Mua sắm", weight: 20 },
  { value: "Khác", weight: 10 }
];

const nguon = [
  { value: "Internet / mạng xã hội", weight: 60 },
  { value: "Bạn bè, người thân", weight: 30 },
  { value: "Công ty lữ hành", weight: 10 }
];

// ===== HÀI LÒNG =====
function genSatisfaction() {
  return weightedRandom([
    { value: "Rất hài lòng", weight: 35 },
    { value: "Hài lòng", weight: 45 },
    { value: "Bình thường", weight: 15 },
    { value: "Không hài lòng", weight: 4 },
    { value: "Rất không hài lòng", weight: 1 }
  ]);
}

// ===== ĐỒNG Ý =====
function genAgree() {
  return weightedRandom([
    { value: "Rất đồng ý", weight: 40 },
    { value: "Đồng ý", weight: 45 },
    { value: "Bình thường", weight: 15 }
  ]);
}

// ===== SUBMIT =====
async function submit() {
  const fbzx = Date.now().toString();

  try {
    await axios.post(url, null, {
      params: {
        // ===== PAGE 1 =====
        "entry.1037771415": weightedRandom(lanDen),
        "entry.1412662165": weightedRandom(lanDen),
        "entry.964122473": weightedRandom(mucDich),
        "entry.1587929637": weightedRandom(nguon),

        // ===== PAGE 2 (HÀI LÒNG) =====
        "entry.34722209": genSatisfaction(),
        "entry.869311741": genSatisfaction(),
        "entry.102657047": genSatisfaction(),
        "entry.1263485055": genSatisfaction(),

        "entry.334213593": genSatisfaction(),
        "entry.1248372751": genSatisfaction(),
        "entry.1523509808": genSatisfaction(),
        "entry.2029416345": genSatisfaction(),

        "entry.433304151": genSatisfaction(),
        "entry.181791762": genSatisfaction(),
        "entry.715559626": genSatisfaction(),
        "entry.2054304500": genSatisfaction(),

        "entry.1125184932": genSatisfaction(),
        "entry.1643045302": genSatisfaction(),
        "entry.869268893": genSatisfaction(),
        "entry.896548699": genSatisfaction(),

        // ===== ĐỒNG Ý =====
        "entry.767955249": genAgree(),
        "entry.715785727": genAgree(),
        "entry.928065215": genAgree(),
        "entry.1647652120": genAgree(),
        "entry.1444755222": genAgree(),

        // ===== CÂU CUỐI =====
        "entry.708751093": genSatisfaction(),
        "entry.559113818": weightedRandom([
          { value: "Hương vị món ăn", weight: 40 },
          { value: "Giá cả", weight: 25 },
          { value: "Không gian", weight: 20 },
          { value: "Phong cách phục vụ", weight: 15 }
        ]),
        "entry.26574986": weightedRandom([
          { value: "Có thể", weight: 40 },
          { value: "Chắc chắn có", weight: 40 },
          { value: "Không chắc", weight: 20 }
        ]),
        "entry.1919345156": weightedRandom([
          { value: "Có thể", weight: 40 },
          { value: "Chắc chắn có", weight: 40 },
          { value: "Không chắc", weight: 20 }
        ]),
        "entry.1133315949": ["Vệ sinh", "Không gian"],

        // ===== PAGE 3 =====
        "entry.1963129288": weightedRandom([
          { value: "Nam", weight: 50 },
          { value: "Nữ", weight: 50 }
        ]),
        "entry.288815417": weightedRandom([
          { value: "Từ 18– 30 tuổi", weight: 60 },
          { value: "Từ 31– 50 tuổi", weight: 30 },
          { value: "Trên 50 tuổi", weight: 10 }
        ]),
        "entry.1961950965": weightedRandom([
          { value: "Sinh viên, học sinh", weight: 50 },
          { value: "Cán bộ, công /nhân viên", weight: 30 },
          { value: "Kinh doanh", weight: 20 }
        ]),
        "entry.657578943": weightedRandom([
          { value: "Chưa có", weight: 40 },
          { value: "Dưới 5 triệu", weight: 40 },
          { value: "Từ 5–10 triệu", weight: 20 }
        ]),
        "entry.1416625791": weightedRandom([
          { value: "Trung học phổ thông", weight: 40 },
          { value: "Cao đẳng, đại học", weight: 50 },
          { value: "Sau đại học", weight: 10 }
        ]),

        // ===== REQUIRED =====
        "fvv": "1",
        "pageHistory": "0,1,2,3",
        "fbzx": fbzx
      }
    });

    console.log("✅ OK");
  } catch (e) {
    console.log("❌", e.message);
  }
}

// ===== RUN 50 LẦN =====
async function run() {
  for (let i = 0; i < 50; i++) {
    await submit();
    await delay();
  }
}

run();
const axios = require("axios");

const url = "https://docs.google.com/forms/d/e/1FAIpQLSchfVQG2GjuZagk1fOjLWyvILZRRNdSBYT1eFrl2ebgg58W8A/formResponse";

// ===== RANDOM =====
function weightedRandom(options) {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;

  for (let o of options) {
    if (r < o.weight) return o.value;
    r -= o.weight;
  }
}

/**
 * Chọn ngẫu nhiên 1..n món (không trùng), luôn theo đúng thứ tự trong `arr` (không đảo thứ tự món).
 * Google Forms checkbox: cùng entry lặp lại trên query string.
 */
function pickRandomMonAn(arr) {
  const n = arr.length;
  const k = Math.floor(Math.random() * n) + 1;
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx
    .slice(0, k)
    .sort((a, b) => a - b)
    .map(i => arr[i]);
}

function serializeFormParams(params) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, String(v));
    } else {
      sp.append(key, String(value));
    }
  }
  return sp.toString();
}

// ===== DELAY 2–6 PHÚT =====
function delay() {
  const min = 2 * 60 * 1000;
  const max = 6 * 60 * 1000;
  return new Promise(r => setTimeout(r, Math.random() * (max - min) + min));
}

// ===== DATA =====

// PAGE 1
const lanDen = [
  { value: "Lần đầu tiên", weight: 60 },
  { value: "2 – 3 lần", weight: 30 },
  { value: "Trên 3 lần", weight: 10 }
];

const mucDich = [
  { value: "Tham quan, du lịch", weight: 40 },
  { value: "Khám phá ẩm thực", weight: 30 },
  { value: "Trải nghiệm, giải trí", weight: 15 },
  { value: "Thăm bạn bè, người thân", weight: 10 },
  { value: "Công tác", weight: 5 }
];

const diCung = [
  { value: "Bạn bè", weight: 40 },
  { value: "Gia đình", weight: 35 },
  { value: "Đi một mình", weight: 15 },
  { value: "Đồng nghiệp", weight: 10 }
];

const nguon = [
  { value: "Internet / mạng xã hội", weight: 60 },
  { value: "Bạn bè, người thân", weight: 25 },
  { value: "Công ty du lịch", weight: 10 },
  { value: "Báo chí / truyền hình", weight: 5 }
];

const amThuc = [
  { value: "Ẩm thực đường phố", weight: 40 },
  { value: "Quán ăn địa phương", weight: 30 },
  { value: "Nhà hàng", weight: 10 },
  { value: "Tất cả các loại trên", weight: 20 }
];

const chiPhi = [
  { value: "200.000 – 500.000 VNĐ (Phân khúc phổ thông)", weight: 50 },
  { value: "Dưới 200.000 VNĐ (Phân khúc tiết kiệm/Ăn vặt)", weight: 30 },
  { value: "500.000 – 1.000.000 VNĐ (Phân khúc trung & cao cấp)", weight: 15 },
  { value: "Trên 1.000.000 VNĐ (Phân khúc sang trọng/Nhà hàng resort)", weight: 5 }
];

// CHECKBOX
const monAn = ["Cao lầu", "Mì Quảng", "Bánh mì Hội An", "Bánh đập hến xào"];

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

// ===== SUBMIT =====
async function submit() {
  const fbzx = Date.now().toString();

  try {
    await axios.post(url, null, {
      params: {
        // ===== PAGE 1 =====
        "entry.2012107368": weightedRandom(lanDen),
        "entry.77162597": weightedRandom(mucDich),
        "entry.1458227595": weightedRandom(diCung),
        "entry.1210340017": weightedRandom(nguon),
        "entry.1972185786": weightedRandom(amThuc),
        "entry.1910954514": weightedRandom(chiPhi),
        "entry.1381397742": weightedRandom([
          { value: "1 ngày", weight: 20 },
          { value: "2 – 3 ngày", weight: 50 },
          { value: "4 – 5 ngày", weight: 25 },
          { value: "Trên 5 ngày", weight: 5 }
        ]),

        // ✅ CHECKBOX MULTI (1 hoặc vài món; mỗi món = một lần entry.1755550919=...)
        "entry.1755550919": pickRandomMonAn(monAn),

        // ===== PAGE 2 =====
        "entry.650341503": genSatisfaction(),
        "entry.1860105775": genSatisfaction(),
        "entry.1964392356": genSatisfaction(),
        "entry.1188746112": genSatisfaction(),
        "entry.1798227533": genSatisfaction(),
        "entry.1062519936": genSatisfaction(),
        "entry.462527060": genSatisfaction(),
        "entry.1071278022": genSatisfaction(),
        "entry.183057795": genSatisfaction(),
        "entry.831606531": genSatisfaction(),
        "entry.292918110": genSatisfaction(),
        "entry.476890760": genSatisfaction(),
        "entry.5349194": genSatisfaction(),
        "entry.1574807566": genSatisfaction(),
        "entry.1687415634": genSatisfaction(),
        "entry.292518132": genSatisfaction(),
        "entry.1518123208": genSatisfaction(),
        "entry.2041984417": genSatisfaction(),
        "entry.1519471427": genSatisfaction(),
        "entry.952113071": genSatisfaction(),
        "entry.603887327": genSatisfaction(),
        "entry.487916415": genSatisfaction(),
        "entry.1242083551": genSatisfaction(),
        "entry.1901005958": genSatisfaction(),

        // ===== PAGE 3 =====
        "entry.1414543677": weightedRandom([
          { value: "Nam", weight: 50 },
          { value: "Nữ", weight: 50 }
        ]),
        "entry.509595948": weightedRandom([
          { value: "18 – 30", weight: 60 },
          { value: "31 – 45", weight: 30 },
          { value: "46 – 60", weight: 10 }
        ]),
        "entry.502673114": weightedRandom([
          { value: "Học sinh / sinh viên", weight: 50 },
          { value: "Nhân viên văn phòng", weight: 30 },
          { value: "Kinh doanh / Tự doanh", weight: 20 }
        ]),
        "entry.742024237": weightedRandom([
          { value: "Dưới 5 triệu VNĐ", weight: 40 },
          { value: "5 – 10 triệu VNĐ", weight: 40 },
          { value: "10 – 20 triệu VNĐ", weight: 20 }
        ]),

        // ===== REQUIRED =====
        "fvv": "1",
        "pageHistory": "0,1,2,3",
        "fbzx": fbzx
      },

      paramsSerializer: serializeFormParams
    });

    console.log("✅ Submit OK:", new Date().toLocaleTimeString());
  } catch (e) {
    console.log("❌ Lỗi:", e.message);
  }
}

// ===== RUN =====
async function run() {
  for (let i = 0; i < 50; i++) {
    await submit();
    await delay();
  }
}

run();
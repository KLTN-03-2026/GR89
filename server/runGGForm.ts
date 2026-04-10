import axios from "axios";

const url = "https://docs.google.com/forms/d/e/1FAIpQLSchfVQG2GjuZagk1fOjLWyvILZRRNdSBYT1eFrl2ebgg58W8A/formResponse"; // 🔥 thay link của bạn

type Weighted<T> = { value: T; weight: number };

// ===== RANDOM =====
function weightedRandom<T>(options: Weighted<T>[]): T {
  if (!options.length) throw new Error("weightedRandom: options rỗng");
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  if (total <= 0) return options[options.length - 1]!.value;
  let r = Math.random() * total;

  for (const o of options) {
    if (r < o.weight) return o.value;
    r -= o.weight;
  }
  return options[options.length - 1]!.value;
}

function delay() {
  return new Promise(r => setTimeout(r, Math.random() * 5000 + 2000));
}

// ===== DATA =====

// Câu 1
const lanDen = [
  { value: "Lần đầu tiên", weight: 60 },
  { value: "2 – 3 lần", weight: 30 },
  { value: "Trên 3 lần", weight: 10 }
];

// Câu 2
const mucDich = [
  { value: "Tham quan, du lịch", weight: 50 },
  { value: "Khám phá ẩm thực", weight: 25 },
  { value: "Trải nghiệm, giải trí", weight: 15 },
  { value: "Thăm bạn bè, người thân", weight: 5 },
  { value: "Công tác", weight: 5 }
];

// Câu 3
const diCung = [
  { value: "Bạn bè", weight: 40 },
  { value: "Gia đình", weight: 35 },
  { value: "Đi một mình", weight: 15 },
  { value: "Đồng nghiệp", weight: 10 }
];

// Câu 4
const nguon = [
  { value: "Internet / mạng xã hội", weight: 60 },
  { value: "Bạn bè, người thân", weight: 25 },
  { value: "Công ty du lịch", weight: 10 },
  { value: "Báo chí / truyền hình", weight: 5 }
];

// Câu 5
const amThuc = [
  { value: "Ẩm thực đường phố", weight: 40 },
  { value: "Quán ăn địa phương", weight: 30 },
  { value: "Nhà hàng", weight: 10 },
  { value: "Tất cả các loại trên", weight: 20 }
];

// Câu 6
const chiPhi = [
  { value: "200.000 – 500.000 VNĐ (Phân khúc phổ thông)", weight: 50 },
  { value: "Dưới 200.000 VNĐ (Phân khúc tiết kiệm/Ăn vặt)", weight: 30 },
  { value: "500.000 – 1.000.000 VNĐ (Phân khúc trung & cao cấp)", weight: 15 },
  { value: "Trên 1.000.000 VNĐ (Phân khúc sang trọng/Nhà hàng resort)", weight: 5 }
];

// ===== HÀI LÒNG (KHÔNG CÓ TIÊU CỰC) =====
function genSatisfactionByMoney(money: string) {
  if (money.includes("Trên 1.000.000")) {
    return weightedRandom([
      { value: "Rất hài lòng", weight: 60 },
      { value: "Hài lòng", weight: 35 },
      { value: "Bình thường", weight: 5 }
    ]);
  }

  if (money.includes("200.000 – 500.000")) {
    return weightedRandom([
      { value: "Rất hài lòng", weight: 35 },
      { value: "Hài lòng", weight: 50 },
      { value: "Bình thường", weight: 15 }
    ]);
  }

  return weightedRandom([
    { value: "Rất hài lòng", weight: 20 },
    { value: "Hài lòng", weight: 50 },
    { value: "Bình thường", weight: 30 }
  ]);
}

// ===== SUBMIT =====
async function submit() {
  const fbzx = Date.now().toString();

  const money = weightedRandom(chiPhi) as string;

  const body = new URLSearchParams();
  const append = (key: string, value: string) => body.append(key, value);

  try {
    // PAGE 1
    append("entry.2012107368", weightedRandom(lanDen) as string);
    append("entry.77162597", weightedRandom(mucDich) as string);
    append("entry.1458227595", weightedRandom(diCung) as string);
    append("entry.1210340017", weightedRandom(nguon) as string);
    append("entry.1972185786", weightedRandom(amThuc) as string);
    append("entry.1910954514", money);
    append(
      "entry.1381397742",
      weightedRandom([
        { value: "1 ngày", weight: 20 },
        { value: "2 – 3 ngày", weight: 50 },
        { value: "4 – 5 ngày", weight: 25 },
        { value: "Trên 5 ngày", weight: 5 },
      ]) as string
    );
    // Checkbox: Google Forms cần cùng entry lặp cho từng lựa chọn
    append("entry.1755550919", "Cao lầu");
    append("entry.1755550919", "Mì Quảng");

    // PAGE 2
    const sat = () => genSatisfactionByMoney(money);
    append("entry.650341503", sat());
    append("entry.1860105775", sat());
    append("entry.1964392356", sat());
    append("entry.1188746112", sat());
    append("entry.1798227533", sat());
    append("entry.1062519936", sat());
    append("entry.462527060", sat());
    append("entry.1071278022", sat());
    append("entry.183057795", sat());
    append("entry.831606531", sat());
    append("entry.292918110", sat());
    append("entry.5349194", sat());
    append("entry.1574807566", sat());
    append("entry.1687415634", sat());
    append("entry.292518132", sat());
    append("entry.1518123208", sat());
    append("entry.2041984417", sat());
    append("entry.1519471427", sat());
    append("entry.952113071", sat());
    append("entry.603887327", sat());
    append("entry.487916415", sat());
    append("entry.1242083551", sat());
    append("entry.1901005958", sat());

    // PAGE 3
    append(
      "entry.1414543677",
      weightedRandom([
        { value: "Nam", weight: 50 },
        { value: "Nữ", weight: 50 },
      ]) as string
    );
    append(
      "entry.509595948",
      weightedRandom([
        { value: "18 – 30", weight: 60 },
        { value: "31 – 45", weight: 30 },
        { value: "46 – 60", weight: 10 },
      ]) as string
    );
    append(
      "entry.502673114",
      weightedRandom([
        { value: "Học sinh / sinh viên", weight: 50 },
        { value: "Nhân viên văn phòng", weight: 30 },
        { value: "Kinh doanh / Tự doanh", weight: 20 },
      ]) as string
    );
    append(
      "entry.742024237",
      weightedRandom([
        { value: "Dưới 5 triệu VNĐ", weight: 40 },
        { value: "5 – 10 triệu VNĐ", weight: 40 },
        { value: "10 – 20 triệu VNĐ", weight: 20 },
      ]) as string
    );

    append("fvv", "1");
    append("pageHistory", "0,1,2,3");
    append("fbzx", fbzx);

    await axios.post(url, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    });

    console.log("✅ OK");
  } catch (e: unknown) {
    console.log("❌", e instanceof Error ? e.message : String(e));
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
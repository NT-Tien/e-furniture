export function generateSixNumberRandom() {
    // Tạo một mảng chứa 6 số ngẫu nhiên từ 0 đến 9
    const randomNumbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));

    // Chuyển mảng thành chuỗi và trả về
    return randomNumbers.join('');
}
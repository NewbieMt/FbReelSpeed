# Facebook Video Speed Controller + Overlay Toggle

Một UserScript nhẹ nhàng và siêu tối ưu giúp bạn toàn quyền kiểm soát trải nghiệm xem Video và Reels trên Facebook.

## 🌟 Tính năng nổi bật

- 🚀 **Điều chỉnh tốc độ mượt mà:** Cung cấp thanh điều khiển tốc độ nhanh chóng từ `0.25x` đến `5.0x`, có thể tùy chỉnh chính xác đến từng `0.1x` thông qua nút cộng/trừ. Lưu lại tốc độ yêu thích của bạn cho lần xem sau.
- 👁️ **Ẩn/Hiện lớp phủ (Overlay):** Giấu đi các nút bấm, mô tả dài dòng trên Reels chỉ với 1 click để có trải nghiệm xem toàn màn hình sạch sẽ nhất.
- ✖️ **Đóng video thu nhỏ:** Tự động thêm nút tắt (Close) tiện lợi cho các video thu nhỏ (Mini Player) tự động bật lên góc màn hình khi bạn cuộn trang.
- ⚡ **Siêu tối ưu (Performance):** Sử dụng cơ chế Debounce an toàn kết hợp MutationObserver tối ưu, đảm bảo không gây giật lag trình duyệt khi lướt Facebook.

## ⚙️ Cài đặt

1. Trước tiên, bạn cần cài đặt tiện ích mở rộng [Tampermonkey](https://www.tampermonkey.net/) hoặc [Violentmonkey](https://violentmonkey.github.io/) cho trình duyệt.
2. Bấm vào link dưới đây để cài đặt script:
   👉 **[Cài đặt FbReelSpeed](https://raw.githubusercontent.com/NewbieMt/FbReelSpeed/main/Fbscript.js)**

## 🎮 Cách sử dụng

- Bảng điều khiển tốc độ sẽ xuất hiện ở **góc dưới bên trái** của mỗi video.
- Nút `👁️` (Ẩn lớp phủ) nằm ở **góc trên bên phải** của video (đặc biệt hữu ích khi xem Reels).
- Nút `✖` để đóng mini-player nằm ở **góc trên bên trái** của video thu nhỏ.

## 🛠️ Dành cho nhà phát triển

Nếu bạn muốn đóng góp hoặc tự tùy chỉnh script:

1. Clone repository này về máy.
2. Thêm file `Fbscript.js` vào Tampermonkey thông qua Dev Mode (`@require file:///...`) để sửa code và xem thay đổi ngay lập tức.
3. Tham khảo các file dev kèm theo trong mã nguồn.

# Kế Hoạch Tạo Models & Relationships (T-CINE)

Sau khi tạo xong Database, bước tiếp theo là tạo các lớp **Model** đại diện cho các bảng. Model sẽ giúp chúng ta tương tác với cơ sở dữ liệu dễ dàng và an toàn hơn thông qua Eloquent ORM.

## Chi tiết các Model & Relationship

### 1. User
- **$fillable:** name, email, password, phone, role
- **Relationships:**
  - `bookings()`: 1 User có nhiều Booking (hasMany).

### 2. Cinema
- **$fillable:** name, address, city, total_screens
- **Relationships:**
  - `rooms()`: 1 Cinema có nhiều Room (hasMany).

### 3. Room
- **$fillable:** cinema_id, name, capacity
- **Relationships:**
  - `cinema()`: Thuộc về 1 Cinema (belongsTo).
  - `seats()`: Có nhiều Seat (hasMany).
  - `showtimes()`: Có nhiều Showtime (hasMany).

### 4. Seat
- **$fillable:** room_id, row, column_num, type, status
- **Relationships:**
  - `room()`: Thuộc về 1 Room (belongsTo).
  - `tickets()`: Thuộc nhiều Ticket (hasMany).

### 5. Movie
- **$fillable:** title, slug, description, poster, banner, trailer_url, genre, director, cast_info, duration, age_rating, rating, release_date, status
- **Relationships:**
  - `showtimes()`: Có nhiều Showtime (hasMany).

### 6. Showtime
- **$fillable:** movie_id, room_id, start_time, end_time, base_price
- **Relationships:**
  - `movie()`: Thuộc về 1 Movie (belongsTo).
  - `room()`: Thuộc về 1 Room (belongsTo).
  - `bookings()`: Có nhiều Booking (hasMany).

### 7. Promotion
- **$fillable:** code, discount_percent, max_discount, valid_from, valid_to, usage_limit, used_count
- **Relationships:**
  - `bookings()`: Được áp dụng cho nhiều Booking (hasMany).

### 8. Combo
- **$fillable:** name, description, price, image
- **Relationships:**
  - `bookingCombos()`: Nằm trong nhiều BookingCombo (hasMany).

### 9. Booking
- **$fillable:** booking_code, user_id, showtime_id, promotion_id, total_amount, discount_amount, final_amount, status
- **Relationships:**
  - `user()`: Thuộc về 1 User (belongsTo).
  - `showtime()`: Thuộc về 1 Showtime (belongsTo).
  - `promotion()`: Áp dụng 1 Promotion (belongsTo - optional).
  - `tickets()`: Có nhiều Ticket (hasMany).
  - `bookingCombos()`: Có nhiều BookingCombo (hasMany).
  - `payment()`: Có 1 Payment (hasOne).

### 10. Ticket
- **$fillable:** booking_id, seat_id, seat_label, seat_type, price
- **Relationships:**
  - `booking()`: Thuộc về 1 Booking (belongsTo).
  - `seat()`: Thuộc về 1 Seat (belongsTo).

### 11. BookingCombo
- **$fillable:** booking_id, combo_id, quantity, unit_price
- **Relationships:**
  - `booking()`: Thuộc về 1 Booking (belongsTo).
  - `combo()`: Thuộc về 1 Combo (belongsTo).

### 12. Payment
- **$fillable:** booking_id, method, transaction_code, amount, status, paid_at
- **Relationships:**
  - `booking()`: Thuộc về 1 Booking (belongsTo).

### 13. Banner
- **$fillable:** title, image_url, link_url, position, is_active
- **(Độc lập, không có relationship)**

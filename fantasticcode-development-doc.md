**BỘ GIÁO DỤC VÀ ĐÀO TẠO BỘ NÔNG NGHIỆP VÀ PTNT**

**TRƯỜNG ĐẠI HỌC THỦY LỢI**

**BÀI TẬP LỚN**

**PHÁT TRIỂN DỰ ÁN PHẦN MỀM**

**Đề Tài:**

**Quản Lý Nhân Sự Trường Đại Học Thủy Lợi**

Nhóm thực hiện: Nhóm 3 - 65KTPM

Giảng viên hướng dẫn: TS.Cù Việt Dũng

*Hà Nội, 2026*

**MỤC LỤC**

# **LỜI NÓI ĐẦU**

Trong kỷ nguyên số hóa mạnh mẽ hiện nay, công nghệ thông tin đã và đang trở thành động lực then chốt thúc đẩy sự phát triển của mọi lĩnh vực trong đời sống xã hội, đặc biệt là trong công tác quản lý và điều hành. Việc ứng dụng các giải pháp phần mềm hiện đại không chỉ góp phần nâng cao hiệu quả làm việc, giảm thiểu sai sót mà còn tối ưu hóa nguồn lực, giúp các tổ chức vận hành một cách khoa học và chuyên nghiệp hơn.

Trong môi trường giáo dục đại học, công tác quản lý nhân sự đóng vai trò vô cùng quan trọng, ảnh hưởng trực tiếp đến chất lượng đào tạo và hoạt động của nhà trường. Tuy nhiên, việc quản lý thông tin cán bộ, giảng viên, nhân viên bằng các phương pháp truyền thống hoặc hệ thống rời rạc thường gặp nhiều hạn chế như khó cập nhật, tra cứu phức tạp và thiếu tính đồng bộ. Trước yêu cầu thực tiễn đó, việc xây dựng một phần mềm quản lý nhân sự phù hợp với đặc thù của Trường Đại học Thủy Lợi là hết sức cần thiết.

Xuất phát từ nhu cầu trên, nhóm chúng em đã tiến hành phân tích yêu cầu khách hàng cho phần mềm quản lý nhân sự Trường Đại học Thủy Lợi, nhằm làm rõ các nghiệp vụ quản lý, xác định các chức năng cần thiết cũng như các yêu cầu phi chức năng của hệ thống. Đây là bước nền tảng quan trọng, giúp định hướng cho quá trình thiết kế và phát triển phần mềm trong các giai đoạn tiếp theo, đồng thời là cơ hội để chúng em vận dụng những kiến thức đã học trong môn *Phát Triển Dự án phần mềm* vào một bài toán thực tế.

Mặc dù đã rất cố gắng, do hạn chế về thời gian và kinh nghiệm, đề tài khó tránh khỏi những thiếu sót nhất định. Nhóm chúng em kính mong nhận được sự góp ý và chỉ dẫn thêm từ thầy để bài làm được hoàn thiện hơn.

Chúng em xin trân trọng cảm ơn!

# **I. PHÂN TÍCH YÊU CẦU KHÁCH HÀNG**

## **1. Bản kế hoạch quản lý yêu cầu (RMP)**

### **1.1. Giới thiệu**

#### ***1.1.1. Phạm vi áp dụng***

Tài liệu Kế hoạch Quản lý Yêu cầu (Requirements Management Plan – RMP) này được xây dựng nhằm xác định các phương pháp, quy trình và công cụ được sử dụng để quản lý các yêu cầu của Hệ thống Quản lý Nhân sự (Human Resource Management System – HRMS) phục vụ Trường Đại học Thủy Lợi.

Tài liệu đóng vai trò là cơ sở để:

##### 1. Định hướng hoạt động thu thập, phân tích, đặc tả và quản lý yêu cầu hệ thống;
##### 2. Đảm bảo các yêu cầu được xác định rõ ràng, nhất quán và có khả năng truy xuất nguồn gốc
##### 3. Hỗ trợ kiểm soát và quản lý các thay đổi yêu cầu trong suốt vòng đời phát triển hệ thống;
##### 4. Làm tài liệu tham chiếu cho các giai đoạn thiết kế, phát triển, kiểm thử và nghiệm thu hệ thống

#### ***1.1.2. Phạm vi áp dụng***

Bản RMP này áp dụng cho toàn bộ các yêu cầu của hệ thống HRMS được phát triển nhằm phục vụ công tác quản lý nhân sự tại **Trường Đại học Thủy Lợi**, bao gồm các đơn vị đào tạo, đơn vị nghiên cứu khoa học, các phòng ban chức năng và các cơ sở trực thuộc nhà trường.

### **1.2. Công cụ sử dụng và các kiểu yêu cầu**

#### ***1.2.1. Các công cụ sử dụng quản lý yêu cầu***

| **STT** | **Công cụ** | **Mục đích sử dụng** |
| --- | --- | --- |
| 1 | Microsoft Word | Soạn thảo và chỉnh sửa các tài liệu quản lý yêu cầu như RMP, SRS |
| 2 | StarUML/ Draw.io | Mô hình hóa tiến trình công việc qua các sơ đồ GANTT, đường Găng.  Mô hình hóa hệ thống thông qua các sơ đồ Use Case, các sơ đồ UML liên quan. |
| 3 | Discord / Họp nhóm trực tiếp | Trao đổi thông tin, thảo luận và xác nhận yêu cầu giữa các thành viên trong nhóm và các bên liên quan |

#### ***1.2.2. Các kiểu yêu cầu cho dự án***

| **Loại yêu cầu** | **Loại tài liệu** | **Mô tả** |
| --- | --- | --- |
| Yêu cầu của các bên liên quan (STRQ) | Yêu cầu của các bên liên quan (STR) | Mô tả các nhu cầu, mong đợi và mục tiêu chính của người dùng và các bên liên quan đối với hệ thống. |
| Yêu cầu tính năng (FEAT) | Tài liệu tầm nhìn (VIS) | Mô tả các điều kiện, khả năng và các tính năng tổng quát mà hệ thống cần cung cấp. |
| Ca sử dụng (UC) / Kịch bản (SC) | Đặc tả ca sử dụng (UCS) | Mô tả chi tiết các ca sử dụng và kịch bản, phản ánh đầy đủ các yêu cầu chức năng của hệ thống. |
| Yêu cầu bổ sung (SUPL) | Đặc tả bổ sung (SS) | Mô tả các yêu cầu phi chức năng và các ràng buộc của hệ thống không được thể hiện trong mô hình ca sử dụng. |

#### ***1.2.3. Loại tài liệu yêu cầu cho dự án***

| **Loại tài liệu** | **Mô tả** | **Loại yêu cầu mặc định** |
| --- | --- | --- |
| Kế hoạch quản lý yêu cầu (RMP) | Tài liệu mô tả phương pháp, quy trình và công cụ quản lý yêu cầu của dự án. | Không áp dụng |
| Yêu cầu của các bên liên quan (STR) | Tập hợp các yêu cầu nghiệp vụ và mong đợi chính từ các bên liên quan. | Yêu cầu bên liên quan (STRQ) |
| Tài liệu tầm nhìn (VIS) | Mô tả tổng quan hệ thống, phạm vi và các mục tiêu chính của dự án. | Yêu cầu tính năng (FEAT) |
| Đặc tả ca sử dụng (UCS) | Mô tả chi tiết các ca sử dụng và cách người dùng tương tác với hệ thống. | Ca sử dụng (UC) và Kịch bản (SC) |
| Đặc tả bổ sung (SS) | Mô tả các yêu cầu phi chức năng và các ràng buộc của hệ thống. | Yêu cầu bổ sung (SUPL) |

### **1.3. Các nhân tố tham gia dự án phần mềm**

| **Team** | **Vai trò** | **Số lượng** | **Nhiệm vụ chính** |
| --- | --- | --- | --- |
| Team 1 | BA / PM | 2 | Phân tích yêu cầu, lập kế hoạch và quản lý tiến độ dự án |
| Team 2 | SA / Design | 4 | Thiết kế kiến trúc hệ thống, cơ sở dữ liệu và giao diện người dùng (UI/UX) |
| Team 3 | Dev | 4 | Phát triển hệ thống Backend và Frontend theo thiết kế |
| Team 4 | Test | 2 | Xây dựng và thực hiện kiểm thử, đảm bảo chất lượng phần mềm |
| Team 5 | Deploy | 2 | Triển khai hệ thống, cấu hình môi trường và thiết lập quy trình CI/CD |
| **Tổng** |  | **14** |  |

### **1.4. Bảng liên lạc với các nhân tố chính (Stakeholder)**

#### ***1.4.1. Các nhân tố chính***

| **STT** | **Nhân tố chính** | **Vai trò trong dự án** | **Đơn vị** | **Trách nhiệm chính** | **Hình thức liên lạc** |
| --- | --- | --- | --- | --- | --- |
| 1 | Ban Giám hiệu | Nhà tài trợ / Phê duyệt | Ban Giám hiệu | Phê duyệt yêu cầu, xem xét báo cáo tổng hợp | Họp định kỳ, báo cáo |
| 2 | Phòng Tổ chức – Cán bộ | Khách hàng nghiệp vụ | Phòng TCCB | Cung cấp yêu cầu quản lý hồ sơ nhân sự | Họp, email |
| 3 | Phòng Tài chính – Kế toán | Khách hàng nghiệp vụ | Phòng TCKT | Cung cấp yêu cầu về lương, phụ cấp | Họp, trao đổi trực tiếp |
| 4 | Phòng CNTT | Đơn vị kỹ thuật | Phòng CNTT | Tư vấn kỹ thuật, hạ tầng, bảo mật | Họp kỹ thuật |
| 2 | Trưởng khoa / phòng | Người sử dụng chính | Các khoa / phòng | Góp ý, xác nhận yêu cầu quản lý nhân sự đơn vị | Họp, khảo sát |
| 6 | Nhóm phát triển | Thực hiện dự án | Nhóm dự án | Phân tích, thiết kế và triển khai hệ thống | Họp nhóm, công cụ trực tuyến |

#### ***1.4.2. Các bên liên quan khác***

| **STT** | **Bên liên quan** | **Vai trò / Mối liên hệ** |
| --- | --- | --- |
| 1 | Bộ Nông nghiệp và Môi trường | Cơ quan quản lý nhà nước, ban hành các quy định liên quan đến nhân sự và chế độ |
| 2 | Bộ Giáo dục và Đào tạo | Cơ quan quản lý chuyên ngành giáo dục, quy định tiêu chuẩn và chính sách đối với cán bộ, giảng viên |
| 3 | Cơ quan Bảo hiểm xã hội | Đơn vị phối hợp trong quản lý bảo hiểm, chế độ cho người lao động |
| 4 | Cơ quan Thuế | Đơn vị phối hợp trong quản lý nghĩa vụ thuế thu nhập cá nhân |

## **2. Tài liệu yêu cầu người dùng (STR)**

### **2.1. Mục đích**

Tài liệu này nhằm thu thập và mô tả các nhu cầu, mong đợi và yêu cầu chính của các bên liên quan đối với Hệ thống Quản lý Nhân sự (HRMS) của Trường Đại học Thủy Lợi. Tài liệu đóng vai trò làm cơ sở cho việc phân tích, xác định yêu cầu phần mềm và hỗ trợ các giai đoạn thiết kế, phát triển và kiểm thử hệ thống.

### **2.2. Phạm vi**

Tài liệu áp dụng cho toàn bộ các yêu cầu của các bên liên quan tham gia vào hệ thống HRMS, bao gồm Ban Giám hiệu, các phòng ban chức năng, các khoa, cán bộ, giảng viên và nhân viên của Trường Đại học Thủy Lợi. Nội dung tập trung vào các yêu cầu nghiệp vụ và mong đợi ở mức tổng quát, không đi sâu vào thiết kế hay chi tiết kỹ thuật.

### **2.3. Yêu cầu thu thập từ Stakeholder**

| **Stakeholder** | **Phương pháp thu thập yêu cầu** | **Yêu cầu (STRQ)** |
| --- | --- | --- |
| Phòng CNTT | Khảo sát | STRQ 1: Cần hệ thống cho phép đăng nhập, đăng xuất, đổi mật khẩu như một hệ thống phần mềm nhân sự khác tài khoản có phân quyền nhiều tài khoản.  STRQ 2: Quản trị viên là người có thể quản lý tài khoản như thêm, sửa hoặc khóa tài khoản |
| Ban giám hiệu | Phỏng vấn | STRQ 3: Quản trị viên có thể quản lý cơ cấu tổ chức, thêm vào các đơn vị mới, chỉnh sửa thông tin hoặc thông báo giải thể, sáp nhập đơn vị  STRQ 4: Phòng nhân sự có thể tạo hợp đồng lao động  STRQ 5: Phòng nhân sự có thể ghi nhận đánh giá nhân sự |
| Phòng Tổ chức Cán bộ | Quan sát, mô phỏng nhiệm vụ | STRQ 6: Phòng nhân sự muốn quản lý hồ sơ nhân sự như thêm, sửa hồ sơ và cho phép đánh dấu thôi việc hồ sơ nếu nhân sự không làm có thêm phương pháp tìm kiếm và lọc để tiện quản lý.  STRQ 7: Phòng nhân sự cần hệ thống cho phép mở khóa đào tạo cho nhân sự  STRQ 8: Phòng nhân sự có thể cấu hình lương, loại phụ cấp, loại hợp đồng |
| Phòng Tài chính Kế Toán | Phỏng vấn | STRQ 9: Phòng tài chính muốn thống kê về nhân sự |
| Trưởng Khoa/ Phòng | Hội thảo yêu cầu | STRQ 10 Người dùng phần mềm có thể xem hồ sơ cá nhân, xem thông tin đơn vị đang công tác  STRQ 11: Người dùng phần mềm có thể đăng ký khóa học được mở, xem các khóa học đã đăng ký |

## **3. Tài liệu đặc trưng (VIS)**

### **3.1. Mục đích**

Tài liệu này định nghĩa tầm nhìn và phạm vi cho dự án Hệ thống Quản lý Nhân sự (HRMS) của Trường Đại học Thủy lợi. Nó cung cấp một cái nhìn tổng quan về nhu cầu kinh doanh, các bên liên quan, và các tính năng cốt lõi của giải pháp, làm cơ sở chung cho đội ngũ phát triển và các bên liên quan (Stakeholders).

### **3.2. Phạm vi**

Hệ thống tập trung vào việc quản lý toàn diện vòng đời nhân sự của nhà trường được các stakeholder đề xuất, thay thế cho các quy trình thủ công rời rạc hiện tại.

Trong phạm vi:

#### 1. Quản lý hồ sơ nhân sự toàn diện (cán bộ, giảng viên, nhân viên)
#### 2. Quản lý hợp đồng lao động
#### 3. Quản lý cơ cấu tổ chức (Khoa/Viện/Bộ môn) và lịch sử biến động cơ bản
#### 4. Quản lý đào tạo và phát triển
#### 5. Cấu hình tham số nghiệp vụ (lương, phụ cấp, hợp đồng)
#### 6. Quản lý nhân sự (bổ nhiệm, miễn nhiệm) trong cơ cấu tổ chức
#### 7. Cổng thông tin tự phục vụ cho nhân viên
#### 8. Báo cáo và thống kê nhân sự

###

### **3.3. Tính năng hệ thống**

| **Yêu cầu (STRQ)** | **Kỹ thuật xác định FEAT** | **Tính năng (FEAT)** |
| --- | --- | --- |
| STRQ 1: Cần hệ thống cho phép đăng nhập, đăng xuất, đổi mật khẩu như một hệ thống phần mềm nhân sự khác tài khoản có phân quyền nhiều tài khoản. | Phân tách  Làm cho đầy đủ | FEAT 1.1: Mọi người dùng có thể đăng nhập bằng tài khoản.  FEAT 1.2: Mọi người dùng có thể đăng xuất khỏi tài khoản đang sử dụng.  FEAT 1.3: Hệ thống tự đống đăng xuất khỏi phiên làm việc nếu người dùng không thao tác với trang web trong 30 phút.  FEAT 1.4: Mọi người dùng có thể đổi mật khẩu tài khoản đang sử dụng. |
| STRQ 2: Quản trị viên là người có thể quản lý tài khoản như thêm, sửa hoặc khóa tài khoản | Phân tách  Thêm chi tiết  Làm cho đầy đủ | FEAT 2.1: Hệ thống cho phép quản trị viên có thể tìm kiếm tài khoản người dùng  FEAT 2.2: Hệ thống cho phép quản trị viên có thể thêm mới tài khoản người dùng  Feat 2.3: Hệ thống cho phép quản trị viên có thể sửa tài khoản người dùng  FEAT 2.4: Hệ thống cho phép quản trị viên có thể thay đổi trạng thái của tài khoản người dùng (Trạng thái: Khóa/ Mở khóa)  FEAT 2.2: Hệ thống có thể tự động khóa tài khoản của nhân sự đã thôi việc |
| STRQ 3: Quản trị viên có thể quản lý cơ cấu tổ chức, thêm vào các đơn vị mới, chỉnh sửa thông tin hoặc thông báo giải thể, sáp nhập đơn vị | Phân tách  Làm cho đầy đủ  Thêm chi tiết  Sửa chữa | FEAT 3.1: Hệ thống cung cấp cơ cấu tổ chức phân cấp đơn vị theo dạng cha-con có gốc là trường Đại học Thủy Lợi.  FEAT 3.2: Hệ thống cho phép quản trị viên thêm mới đơn vị tổ chức nhân sự  FEAT 3.3: Hệ thống cho phép quản trị viên sửa thông tin đơn vị tổ chức nhân sự  FEAT 3.4: Hệ thống cho phép quản trị viên thay đổi trạng thái của đơn vị tổ chức nhân sự (Trạng thái: Giải thể /Sáp nhập)  FEAT 3.2: Hệ thống cho phép phòng nhân sự bổ nhiệm nhân sự vào một đơn vị tổ chức nhân sự  FEAT 3.6: Hệ thống cho phép phòng nhân sự bãi nhiệm nhân sự khỏi một đơn vị tổ chức nhân sự  FEAT 3.7: Hệ thống cho phép phòng nhân sự và quản trị viên xem chi tiết thông tin đơn vị tổ chức nhân sự |
| STRQ 4: Phòng nhân sự có thể tạo hợp đồng lao động | Thêm chi tiết | FEAT 4.1: Hệ thống cho phép phòng nhân sự tạo hợp đồng cho nhân sự không có hợp đồng hoặc cần gia hạn hợp đồng. |
| STRQ 5: Phòng nhân sự có thể ghi nhận đánh giá nhân sự | Sao chép | FEAT 5.1: Hệ thống cho phép phòng nhân sự ghi đánh giá cho nhân sự (Loại đánh giá: Khen thưởng/ Kỷ luật) |
| STRQ 6: Phòng nhân sự muốn quản lý hồ sơ nhân sự như thêm, sửa hồ sơ và cho phép đánh dấu thôi việc hồ sơ nếu nhân sự không làm có thêm phương pháp tìm kiếm và lọc để tiện quản lý. | Phân tách  Làm cho rõ ràng  Thêm chi tiết | FEAT 6.1: Hệ thống cho phép phòng nhân sự tìm kiếm hồ sơ nhân sự  FEAT 6.2: Hệ thống cho phép phòng nhân sự lọc hồ sơ nhân sự  FEAT 6.3: Hệ thống cho phép phòng nhân sự thêm mới hồ sơ nhân sự  FEAT 6.4: Hệ thống cho phép phòng nhân sự chỉnh sửa hồ sơ nhân sự  FEAT 6.2: Hệ thống cho phép phòng nhân sự đánh dấu thôi việc nhân sự  FEAT 6.6: Hệ thống có thể tự động đánh dấu thôi việc nhân sự nếu hợp đồng hết hạn quá thời gian cho phép của loại hợp đồng  FEAT 6.7: Hệ thống cho phép phòng nhân sự và phòng tài chính có thể xem chi tiết hồ sơ nhân sự  FEAT 6.8: Hệ thống cho phép phòng nhân sự và phòng tài chính có thể in hồ sơ nhân sự |
| STRQ 7: Phòng nhân sự cần hệ thống cho phép mở khóa đào tạo cho nhân sự | Phân tách  Làm cho đầy đủ | FEAT 7.1: Hệ thống cho phép phòng nhân sự mở khóa đào tạo cho cán bộ  FEAT 7.2: Hệ thống cho phép phòng nhân sự chỉnh sửa khóa đào tạo đã mở cho cán bộ  FEAT 7.3: Hệ thống cho phép phòng nhân sự xem thông tin khóa đào tạo đã mở cho cán bộ  FEAT 7.4: Hệ thống cho phép phòng nhân sự ghi nhận kết quả đánh giá cho cán bộ đã tham gia |
| STRQ 8: Phòng nhân sự có thể cấu hình lương, loại phụ cấp, loại hợp đồng | Phân tách  Làm cho đầy đủ | FEAT 8.1: Hệ thống cho phép phòng nhân sự thêm mới hệ số lương (Hệ số lương được thêm sẽ được dùng để làm thông tin cho hồ sơ nhân sự)  FEAT 8.2: Hệ thống cho phép phòng nhân sự xóa hệ số lương khi không được hồ sơ nào sử dụng  FEAT 8.3: Hệ thống cho phép phòng nhân sự sửa thông tin hệ số lương  FEAT 8.4: Hệ thống cho phép phòng nhân sự ngừng sử dụng hệ số lương (Hệ số lương bị đánh dấu ngừng sử dụng sẽ không được hồ sơ mới sử dụng)  FEAT 8.2: Hệ thống cho phép phòng nhân sự thêm mới loại phụ cấp (Loại phụ cấp được thêm sẽ được dùng để làm thông tin cho hồ sơ nhân sự)  FEAT 8.6: Hệ thống cho phép phòng nhân sự sửa loại phụ cấp  FEAT 8.7: Hệ thống cho phép phòng nhân sự ngừng sử dụng loại phụ cấp (Loại phụ cấp bị đánh dấu ngừng sử dụng sẽ không được hồ sơ mới sử dụng)  FEAT 8.8: Hệ thống cho phép phòng nhân sự thêm mới loại hợp đồng (Loại hợp đồng được thêm sẽ được dùng để làm thông tin cho hợp đồng)  FEAT 8.9: Hệ thống cho phép phòng nhân sự sửa loại hợp đồng  FEAT 8.10: Hệ thống cho phép phòng nhân sự ngừng sử dụng loại hợp đồng (Loại hợp đồng bị đánh dấu ngừng sử dụng sẽ không được hợp đồng mới sử dụng) |
| STRQ 9: Phòng tài chính muốn thống kê về nhân sự | Thêm các chi tiết | FEAT 9.1: Hệ thống cho phép phòng nhân sự và phòng tài chính xem các thống kê nhân sự: thống kê tổng quan nhân sự, biến động nhân sự, cơ cấu nhân sự theo đơn vị, đánh giá của cán bộ với khóa đào tạo, hợp đồng. |
| STRQ 10 Người dùng phần mềm có thể xem hồ sơ cá nhân, xem thông tin đơn vị đang công tác | Phân tách | FEAT 10.1: Mọi người dùng trong hệ thống có thể xem thông tin cá nhân của mình  FEAT 10.2: Mọi người dùng có thể xem thông tin đơn vị mình đang công tác |
| STRQ 11: Người dùng phần mềm có thể đăng ký khóa học được mở, xem các khóa học đã đăng ký | Phân tách | FEAT 11.1: Mọi người dùng trong hệ thống có thể đăng ký khóa đào tạo  FEAT 11.2: Mọi người dùng có thể đăng ký khóa đào tạo đã đăng ký |

### **3.4. Ràng buộc và yêu cầu chất lượng**

#### ***3.4.1. Ràng buộc***

##### 1. Hạ tầng: Hệ thống phải vận hành trên hạ tầng máy chủ nội bộ (On-premise) hiện có của Trường Đại học Thủy lợi.
##### 2. Pháp lý: Tuân thủ tuyệt đối Bộ Luật Lao động 2019, Luật Viên chức và các quy định về bảo mật dữ liệu cá nhân.
##### 3. Tích hợp: Phải có khả năng kết nối (API hoặc Excel Export/Import) với phần mềm Kế toán và Đào tạo hiện có.
##### 4. Ngôn ngữ: Giao diện và tài liệu 100% Tiếng Việt.

#### ***3.4.2. Yêu cầu chất lượng***

##### 1. Hiệu năng: Hỗ trợ tối thiểu 200 người dùng đồng thời; Thời gian phản hồi trang thông thường dưới 2 giây.
##### 2. Bảo mật: Phân quyền ở mức chức năng cho mỗi vai trò để bảo vệ thông tin nhạy cảm (Lương, SĐT, Địa chỉ,..).
##### 3. Khả dụng: Đảm bảo hoạt động 99.2% trong giờ hành chính. Sao lưu dữ liệu tự động hàng ngày.

## **4. Tài liệu UseCase (UCS)**

### **4.1. Mục đích**

Tài liệu Đặc tả Ca sử dụng (UCS) này nhằm mô tả chi tiết các tương tác giữa các tác nhân (Actors) như Quản trị viên, Cán bộ TCCB, Cán bộ TCKT với hệ thống HRMS. Đây là căn cứ quan trọng để:

- Đội ngũ thiết kế xây dựng giao diện người dùng (UI/UX).
- Đội ngũ lập trình nắm rõ luồng nghiệp vụ (Basic Flow, Alternative Flow) để thực hiện code.
- Đội ngũ kiểm thử xây dựng các kịch bản kiểm thử (Test Cases) tương ứng.

### **4.2. Phạm vi**

Tài liệu này tập trung đặc tả các Use Case thuộc phạm vi của dự án, bao gồm:

- Hệ thống: Đăng nhập, Đăng xuất, Quản lý và Phân quyền người dùng.
- Cấu hình: Quản lý lương, phụ cấp, hợp đồng.
- Nghiệp vụ nhân sự: Quản lý hồ sơ, trình độ, chức danh, đánh giá, đào tạo và cơ cấu tổ chức.

### **4.3. Sơ đồ UseCase**

#### 4.3.1. Sơ đồ Use Case tổng quát

#### 4.3.2. Sơ đồ phân rã Module Use Case

*4.3.2.1. Quản lý tài khoản người dùng*

*4.3.2.2. Quản lý cấu hình hệ số lương*

*4.3.2.3. Quản lý cấu hình loại phụ cấp*

*4.3.2.4. Quản lý cấu hình loại hợp đồng*

*4.3.2.2. Quản lý hồ sơ nhân sự*

*4.3.2.6. Quản lý đơn vị tổ chức nhân sự*

*4.3.2.7. Quản lý khoá đào tạo*

## **5. Kịch bản use case (UCS)**

**5.1. Đặc tả use case: Đăng nhập**

| **Tên use case** | **Đăng nhập** |
| --- | --- |
| Tác nhân chính | Quản trị viên, Cán bộ TCCB, Cán bộ TCKT, Cán bộ nhân sự |
| Mục đích (mô tả) | Cho phép người dùng xác thực và truy cập vào hệ thống dựa trên thông tin tài khoản được cấp. |
| Mức độ ưu tiên  (Priority) | Bắt buộc |
| Điều kiện kích hoạt  (Trigger) | Ấn “Đăng nhập” |
| Điều kiện tiên quyết  (Precondition) | Người dùng đã được cấp tài khoản.  Hệ thống đang hoạt động bình thường. |
| Điều kiện thành công  (Post-condition) | Người dùng được chuyển đến trang chủ (Dashboard) tương ứng với vai trò của mình. |
| Điều kiện thất bại | Tác nhân đăng nhập vào tài khoản thất bại |
| Luồng sự kiện chính  (Basic Flow) | 1.  Người dùng truy cập vào địa chỉ web của hệ thống.  2.  Hệ thống hiển thị màn hình Đăng nhập.  3.  Người dùng nhập `Tên đăng nhập` và `Mật khẩu`.  4.  Người dùng nhấn nút "Đăng nhập".  5.  Hệ thống kiểm tra tính hợp lệ của dữ liệu nhập (không được để trống).  6.  Hệ thống xác thực thông tin tài khoản với cơ sở dữ liệu.  7.  Hệ thống kiểm tra trạng thái tài khoản (Active/ Lock).  8.  Hệ thống xác định vai trò của người dùng.  9.  Hệ thống chuyển hướng người dùng đến Dashboard tương ứng. |
| Luồng sự kiện thay thế  (Alternative Flow) | **A1: Đăng nhập khi đã có session**   1. Tại bước 1, Người dùng truy cập trang đăng nhập khi đã có session hợp lệ, 2. Hệ thống tự động chuyển hướng vào Dashboard. |
| Luồng sự kiện ngoại lệ  (Exception Flow) | **E1: Sai Tên đăng nhập hoặc Mật khẩu**   1. Tại bước 6, hệ thống kiểm tra thông tin không khớp. 2. Hệ thống hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không đúng". 3. Quay về bước 3   **E2: Tài khoản bị khóa**   1. Tại bước 7, nếu tài khoản bị khóa, 2. Hệ thống hiển thị thông báo "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên".   **E3: Không hợp lệ Tên đăng nhập hoặc Mật khẩu**   1. Tại bước 2, hệ thống kiểm tra không hợp lệ 2. Hệ thống hiển thị thông báo “Vui lòng nhập tên đăng nhập và mật khẩu hợp lệ” 3. Quay lại bước 3 |

**5.2. Đặc tả use case: Đăng xuất**

| **Tên use case** | **Đăng xuất** |
| --- | --- |
| Tác nhân chính | Quản trị viên, Cán bộ TCCB, Cán bộ TCKT, Cán bộ nhân sự |
| Mục đích (mô tả) | Cho phép người dùng thoát khỏi phiên làm việc hiện tại một cách an toàn. |
| Mức độ ưu tiên  (Priority) | Bắt buộc |
| Điều kiện kích hoạt  (Trigger) | Ấn “Đăng xuất” |
| Điều kiện tiên quyết  (Precondition) | Người dùng đang trong phiên đăng nhập hợp lệ. |
| Điều kiện thành công  (Post-condition) | Phiên làm việc bị hủy bỏ.  Người dùng được chuyển về màn hình Đăng nhập. |
| Điều kiện thất bại | Không có |
| Luồng sự kiện chính  (Basic Flow) | 1. Người dùng chọn "Đăng xuất".  2. Hệ thống yêu cầu xác nhận đăng xuất  3. Người dùng xác nhận đăng xuất. Nếu chọn hủy thì qua E1  4. Hệ thống hủy session hiện tại.  5. Hệ thống chuyển hướng về trang Đăng nhập. |
| Luồng sự kiện thay thế  (Alternative Flow) | **A1: Đăng xuất tự động**  1.  Hệ thống giám sát thời gian không hoạt động của người dùng.  2.  Nếu thời gian idle vượt quá **30 phút**  3.  Hệ thống tự động hủy session.  4.  Hệ thống hiển thị thông báo "Phiên làm việc đã hết hạn" và chuyển về trang Đăng nhập. |
| Luồng sự kiện ngoại lệ  (Exception Flow) | E1: Người dùng không xác thực  1. Người dùng chọn Hủy  2. Kết thúc chức năng |

## **6. Các yêu cầu phi chức năng**

### **6.1. Mục đích**

Mục này xác định các tiêu chuẩn chất lượng, ràng buộc kỹ thuật và các điều kiện vận hành mà hệ thống HRMS phải đáp ứng. Các yêu cầu này đảm bảo hệ thống không chỉ hoạt động đúng về mặt nghiệp vụ mà còn phải nhanh, an toàn, dễ sử dụng và tuân thủ các quy định pháp luật hiện hành.

### **6.2. Phạm vi**

Các yêu cầu phi chức năng trong tài liệu này áp dụng cho toàn bộ các thành phần của hệ thống Quản lý nhân sự, bao gồm:

- Hiệu năng hoạt động: Yêu cầu về tốc độ và khả năng chịu tải.
- Khả năng thích ứng: Liên quan đến khả năng phát triển lâu dài.
- Tính tương thích: Khả năng kết nối với các phần mềm khác và hoạt động tốt trên nhiều môi trường khác nhau.
- An toàn thông tin: Yêu cầu bảo vệ dữ liệu.
- Độ tin cậy: Khả năng duy trì hoạt động và phục hồi.
- Yêu cầu lưu trữ: Quy định về thời gian giữ dữ liệu.
- Tính khả dụng: Mức độ dễ dùng và hài lòng.

### **6.3. Chi tiết các yêu cầu phi chức năng**

Hệ thống HRMS được thiết kế để đáp ứng đầy đủ 19 yêu cầu tiêu chuẩn về vận hành, an toàn và pháp lý như sau:

| **Yếu tố chất lượng** | **Tiêu chuẩn đo lường** | **Tiêu chuẩn đáp ứng** |
| --- | --- | --- |
| Hiệu năng hoạt động | Thời gian phản hồi hệ thống | Thời gian phản hồi trang thông thường dưới 2 giây. |
| Hiệu năng hoạt động | Công suất tải hệ thống | Hệ thống hỗ trợ tối thiểu 200 người dùng truy cập đồng thời. |
| Khả năng thích ứng | Kiến trúc hệ thống | Kiến trúc hệ thống hỗ trợ khả năng mở rộng linh hoạt khi quy mô người dùng tăng lên. |
| Tính tương thích | Khả năng quản lý đa chi nhánh | Hệ thống hỗ trợ quản lý đa cơ sở (Hà Nội, Phố Hiến, TP.HCM) đồng nhất trên một nền tảng |
| An toàn thông tin | Bảo mật lưu trữ mật khẩu | Mật khẩu người dùng phải được mã hóa trước khi lưu trữ vào cơ sở dữ liệu. |
| An toàn thông tin | Kiểm soát quyền truy cập | Hệ thống phải đảm bảo kiểm tra quyền hạn ở mọi API để ngăn chặn tuyệt đối truy cập trái phép. |
| An toàn thông tin | Bảo mật truyền tải dữ liệu | Dữ liệu nhạy cảm phải được mã hóa và truyền tải qua giao thức bảo mật HTTPS. |
| An toàn thông tin | Khả năng phân tích và hậu kiểm | Hệ thống ghi nhật ký (log) tất cả các thao tác quan trọng của người dùng. |
| An toàn thông tin | Quản lý phiên làm việc (Session) | Phiên làm việc tự động hết hạn (timeout) sau 30 phút nếu không có hoạt động. |
| An toàn thông tin | Chính sách độ phức tạp mật khẩu | Mật khẩu tối thiểu 8 ký tự, bao gồm đầy đủ: chữ hoa, chữ thường và số. |
| Độ tin cậy | Tính sẵn sàng của dịch vụ (Uptime) | Đảm bảo hệ thống hoạt động ổn định 99.2% trong khung giờ hành chính. |
| Độ tin cậy | Tần suất và thời gian lưu trữ sao lưu | Sao lưu dữ liệu tự động hàng ngày và lưu trữ bản sao trong vòng 30 ngày. |
| Độ tin cậy | Chỉ số phục hồi sự cố (RTO/RPO) | Thời gian phục hồi (RTO) dưới 4 giờ và điểm phục hồi (RPO) dưới 24 giờ. |
| Yêu cầu lưu trữ | Khả năng lưu trữ hồ sơ lâu dài | Hệ thống có khả năng lưu trữ hồ sơ nhân sự an toàn trong thời gian tối thiểu 10 năm. |
| Tính khả dụng | Giao diện và tính đáp ứng | Giao diện Tiếng Việt hoàn toàn, thân thiện và hiển thị tốt trên nhiều kích thước màn hình. |
| Tính khả dụng | Thời gian học sử dụng | Người dùng có thể sử dụng hệ thống sau tối đa 4 giờ đào tạo hướng dẫn. |
| Tính khả dụng | Khả năng khai thác | Cung cấp đầy đủ bộ tài liệu hướng dẫn sử dụng chi tiết cho từng vai trò người dùng. |
| Tính khả dụng | Hỗ trợ thiết bị di động | Cổng Self-Service phải hỗ trợ tốt trên thiết bị di động và máy tính bảng. |
| Tính tương thích | Tương tác liên thông dữ liệu | Dữ liệu xuất bản (export) phải tương thích hoàn toàn với định dạng của phần mềm kế toán. |

# **II. LẬP KẾ HOẠCH DỰ ÁN**

## **1. Bảng phân chia công việc**

| **MSV** | **Họ và tên** |
| --- | --- |
| 2321170611 | Nguyễn Hồng Phúc |
| 2321170631 | Ngô Quang Tùng |
| 2321170609 | Nguyễn Hải Ninh |
| 2321060422 | Ngô Đức Nam Khánh |
| 2321170630 | Hoàng Tùng |

## **2. Giới thiệu**

### **2.1. Mục tiêu dự án**

#### 2.1.1. Mục tiêu tổng quát

- Xây dựng một hệ thống phần mềm quản lý nhân sự tập trung, thống nhất và toàn diện cho Trường Đại học Thủy lợi.
- Thay thế các quy trình quản lý thủ công, rời rạc hiện tại bằng quy trình số hóa tự động.
- Tạo ra một nguồn dữ liệu duy nhất về nhân sự.
- Nâng cao hiệu quả quản lý hành chính, đảm bảo tính chính xác của dữ liệu lương thưởng.
- Tuân thủ tuyệt đối các quy định pháp luật hiện hành.

#### 2.1.2. Mục tiêu cụ thể

- Số hóa và Tập trung hóa dữ liệu nhân sự
- Loại bỏ lưu trữ phân tán: Chuyển đổi toàn bộ hồ sơ nhân sự từ giấy tờ và các file Excel rời rạc sang cơ sở dữ liệu tập trung.
- Quản lý hồ sơ toàn diện: Lưu trữ đầy đủ thông tin cá nhân, quá trình công tác, trình độ chuyên môn, bằng cấp, chứng chỉ, thông tin Đảng/Đoàn và quan hệ gia đình của hơn 1.200 cán bộ giảng viên.
- Quản lý linh hoạt Cơ cấu tổ chức đặc thù
- Mô hình phân cấp phức tạp: Quản lý được cơ cấu tổ chức đa cấp (Trường - Khoa/Viện - Bộ môn) và các đơn vị chức năng đặc thù của trường đại học.
- Lưu vết lịch sử: Lịch sự biến đổi nhân sự trong cơ cấu tổ chức.
- Tự động hóa quy trình Hợp đồng và Cảnh báo
- Quản lý vòng đời hợp đồng: Giả lập một quy trình cho phép theo dõi chặt chẽ từ khi ký mới, thử việc, gia hạn đến khi chấm dứt hợp đồng hoặc nghỉ hưu.
- Cảnh báo thông minh: Hệ thống tự động điều chỉnh trạng thái hợp đồng gửi cảnh báo cho Phòng Tổ chức Cán bộ về các mốc thời gian quan trọng.
- Cung cấp nền tảng cấu hình nghiệp vụ động
- Thích ứng với thay đổi luật: Cho phép Quản trị viên tự cấu hình các tham số như hệ số ngạch/bậc, định mức phụ cấp, hợp đồng mà không cần can thiệp vào mã nguồn và một số cấu hình mới trong tương lai.
- Hỗ trợ dữ liệu tài chính chính xác
- Chuẩn hóa dữ liệu lương: Cung cấp dữ liệu đầu vào chính xác (ngạch, bậc, hệ số, phụ cấp, người phụ thuộc, thông tin khen thưởng/kỷ luật) cho hệ thống kế toán để thực hiện chi trả lương và tính thuế thu nhập cá nhân.
- Lưu ý: Hệ thống không trực tiếp tính bảng lương chi tiết mà đóng vai trò cung cấp dữ liệu nguồn tin cậy.
- Nâng cao trải nghiệm người dùng qua Cổng tự phục vụ
- Minh bạch thông tin: Cung cấp cổng thông tin tự phục vụ cho Cán bộ/Giảng viên để họ có thể tự tra cứu hồ sơ, lịch sử hợp đồng, và kết quả thi đua khen thưởng của chính mình.
- Giảm tải hành chính: Cho phép nhân sự đăng ký đào tạo trực tuyến, giảm bớt thời gian đi lại và giấy tờ.
- Hỗ trợ ra quyết định
- Báo cáo thời gian thực: Cung cấp Dashboard tổng quan và các báo cáo thống kê tức thời về biến động nhân sự, cơ cấu trình độ, độ tuổi cho Ban Giám hiệu.
- Tuân thủ Biểu mẫu: Xuất các báo cáo theo đúng Biểu mẫu quy định của Bộ Giáo dục và Đào tạo, Bộ Nông nghiệp và Phát triển Nông thôn và Bộ Nội vụ.

#### 2.1.3. Phạm vi giới hạn của mục tiêu

- Quản lý sinh viên và kết quả học tập.
- Tính toán chi tiết và chi trả lương hàng tháng (chỉ quản lý tham số lương).
- Quản lý nghiên cứu sinh và các hoạt động của phòng thí nghiệm chuyên sâu.
- Đánh giá hiệu suất công việc chi tiết hàng tháng (chỉ quản lý kết quả đánh giá viên chức hàng năm).
- Tạo quy trình đánh giá khen thưởng/kỷ luật.
- Quản lý giờ giảng

### **2.2. Phạm vi dự án**

#### 2.2.1. Phạm vi trong dự án

- Quản lý hồ sơ nhân sự toàn diện bao gồm cán bộ, giảng viên và nhân viên.
- Quản lý vòng đời hợp đồng lao động và tự động cảnh báo các mốc thời gian quan trọng như hết hạn hợp đồng.
- Quản lý cơ cấu tổ chức theo mô hình phân cấp Khoa, Viện, Bộ môn và theo dõi lịch sử biến động của các đơn vị.
- Quản lý hoạt động đào tạo và phát triển chuyên môn cho đội ngũ nhân sự.
- Cấu hình tham số nghiệp vụ linh hoạt bao gồm mức lương, phụ cấp, hợp đồng.
- Quản lý tổ chức nhân sự bao gồm các quy trình bổ nhiệm, miễn nhiệm và quản lý chức vụ tại các đơn vị nhân sự.
- Cung cấp cổng thông tin tự phục vụ cho nhân viên để tra cứu hồ sơ và đăng ký khóa đào tạo.
- Tổng hợp báo cáo và thống kê nhân sự phục vụ công tác quản lý và báo cáo cấp trên.

#### 2.2.2. Phạm vi ngoài dự án

- Quản lý thông tin và các hoạt động học tập của sinh viên.
- Thực hiện tính toán và chi trả bảng lương chi tiết hàng tháng (hệ thống chỉ đóng vai trò cung cấp dữ liệu đầu vào cho bộ phận kế toán).
- Quản lý các hoạt động đào tạo dành cho sinh viên.
- Quản lý quy trình đánh giá hiệu suất và xếp loại viên chức hàng năm.
- Quản lý đối tượng Nghiên cứu sinh.
- Quản lý hoạt động, thiết bị và nhân sự chuyên trách của Phòng thí nghiệm.
- Cấu hình chi tiết các tham số phức tạp liên quan đến Bảo hiểm và Thuế.
- Quản lý phiên bản hóa đối với các cấu hình hệ thống.
- Quản lý các thông tin chuyên môn sâu của giảng viên như lĩnh vực nghiên cứu chi tiết hay từ khóa chuyên ngành.

## **3. Tổ chức dự án**

### **3.1. Cơ cấu tổ chức**

**Nhà đầu tư:** Khoa Công nghệ thông tin - Trường Đại học Thủy Lợi

**Quản lý dự án:** Nguyễn Hồng Phúc

**Nhóm phát triển dự án:**

- Nguyễn Hồng Phúc:
- Ngô Quang Tùng
- Nguyễn Hải Ninh
- Ngô Đức Nam Khánh
- Hoàng Tùng

### **3.2. Vai trò và trách nhiệm**

| **Vai trò** | **Trách nhiệm** |
| --- | --- |
| Quản lý và lập kế hoạch dự án | Lập kế hoạch tổng thể, theo dõi tiến độ, điều phối công việc, đảm bảo dự án hoàn thành đúng mục tiêu. |
| Phân tích yêu cầu khách hàng | Thu thập và phân tích yêu cầu, xây dựng tài liệu đặc tả. |
| Phân tích và thiết kế hệ thống | Thiết kế kiến trúc hệ thống, cơ sở dữ liệu và giao diện người dùng. |
| Lập trình viên | Phát triển các chức năng của hệ thống theo thiết kế. |
| Kiểm thử | Kiểm tra chất lượng hệ thống, phát hiện và báo cáo lỗi. |
| Người dùng cuối | Tham gia phản hồi, đánh giá hệ thống trong quá trình thử nghiệm. |

### **3.3. Phạm vi tài nguyên**

- Draw.io để xây dựng sơ đồ gantt
- StarUML để để vẽ các Biểu đồ UML
- Figma để thiết kế giao diện
- Selenium để kiểm thử
- Các ngôn ngữ cho dự án: TypeScript
- Môi trường lập trình: Visual Studio Code

## **4. Phân tích rủi ro**

### **4.1. Bảng phân tích rủi ro**

| **STT** | **Rủi ro** | **Xác suất** | **Tác động** | **Giải pháp** |
| --- | --- | --- | --- | --- |
| 1 | Thời gian yêu cầu để phát triển phần mềm bị ước lượng quá thấp | Cao | Nghiêm trọng | Chia nhỏ công việc, rà soát tiến độ định kỳ, điều chỉnh kế hoạch và phân công linh hoạt khi cần |
| 2 | Chi phí phát triển ước tính quá thấp | Trung bình | Trung bình | Lập ngân sách dự phòng, theo dõi chi phí định kỳ, ưu tiên các hạng mục quan trọng |
| 3 | Yêu cầu của khách hàng thay đổi liên tục | Thấp | Nghiêm trọng | Xác nhận yêu cầu từ sớm, quản lý thay đổi chặt chẽ, cập nhật tài liệu và đánh giá tác động khi có thay đổi |
| 4 | Công nghệ sử dụng có khiếm khuyết hạn chế chức năng | Thấp | Trung bình | Đánh giá công nghệ từ sớm, thử nghiệm nguyên mẫu, chuẩn bị phương án thay thế |
| 5 | Nhân sự chủ chốt không sẵn sàng trong giai đoạn quan trọng | Trung bình | Nghiêm trọng | Phân công chéo công việc, lưu trữ tài liệu đầy đủ, chuẩn bị nhân sự dự phòng |
| 6 | Lỗi kỹ thuật nghiêm trọng làm chậm tiến độ bàn giao | Thấp | Nghiêm trọng | Thực hiện kiểm thử định kỳ, rà soát chất lượng mã nguồn, ưu tiên xử lý lỗi quan trọng |
| 7 | Code chất lượng kém, khó bảo trì | Cao | Cao | Áp dụng coding standard, review code định kỳ, sử dụng công cụ kiểm soát chất lượng |
| 8 | Máy chủ không đáp ứng được lượng truy cập tăng đột biến | Thấp | Thảm khốc | Lựa chọn hạ tầng có khả năng mở rộng, giám sát tài nguyên hệ thống, xây dựng kế hoạch sao lưu và khôi phục |
| 9 | Mất dữ liệu do lỗi hệ thống hoặc thao tác sai | Thấp | Thảm khốc | Thiết lập cơ chế sao lưu tự động, kiểm tra khả năng phục hồi dữ liệu định kỳ |
| 10 | Thiếu kinh nghiệm với công nghệ sử dụng | Trung bình | Trung bình | Đào tạo bổ sung, tham khảo tài liệu chính thức, phân công công việc phù hợp năng lực |

### **4.2. Công thức tính độ rủi ro**

-Áp dụng quy trình phân tích rủi ro định tính dựa trên PMBOK guide:

Gán điểm cho Xác suất (P):

- Cao: 3 điểm
- Trung bình: 2 điểm
- Thấp: 1 điểm

**Gán điểm cho Tác động (I):**

- Thảm khốc: 4 điểm
- Nghiêm trọng: 3 điểm
- Trung bình: 2 điểm
- Thấp: 1 điểm

Công thức:R = P x I

### **4.3. Bảng tính toán cụ thể**

| **STT** | **Rủi ro** | **P** | **I** | **Độ rủi ro (R)** | **Phân loại** |
| --- | --- | --- | --- | --- | --- |
| 1 | Ước lượng thời gian quá thấp | 3 | 3 | 9 | Rủi ro rất cao |
| 2 | Chi phí ước tính quá thấp | 2 | 2 | 4 | Trung bình |
| 3 | Yêu cầu thay đổi liên tục | 1 | 3 | 3 | Thấp/Trung bình |
| 4 | Công nghệ có khiếm khuyết | 1 | 2 | 2 | Thấp |
| 5 | Nhân sự chủ chốt vắng mặt | 2 | 3 | 6 | Rủi ro cao |
| 6 | Lỗi kỹ thuật chậm tiến độ | 1 | 3 | 3 | Thấp/Trung bình |
| 7 | Code chất lượng kém | 3 | 3 | 9 | Rủi ro rất cao |
| 8 | Máy chủ quá tải đột biến | 1 | 4 | 4 | Trung bình |
| 9 | Mất dữ liệu hệ thống | 1 | 4 | 4 | Trung bình |
| 10 | Thiếu kinh nghiệm công nghệ | 2 | 2 | 4 | Trung bình |

- Nhóm đã áp dụng khả năng chịu đựng rủi ro và ngưỡng rủi ro trong chuẩn PMBOK và ISO 31000 và phân loại:

+ Điểm 9 - 12 (Vùng Đỏ): Rủi ro nguy cấp. Cần có kế hoạch dự phòng cực kỳ chi tiết.

+ Điểm 4 - 8 (Vùng Vàng): Rủi ro đáng chú ý. Cần theo dõi định kỳ.

+ Điểm 1 - 3 (Vùng Xanh): Rủi ro thấp. Có thể chấp nhận được và chỉ cần xử lý khi nó xảy ra.

### **4.4. Cơ sở xác định các tham số thời gian**

#### ***4.4.1 Bảng chuyển đổi rủi ro thành thời gian dự phòng***

**Ghi chú:**

- tm (Khả thi nhất): Mục tiêu.
- to (Lạc quan): Nếu rủi ro không xảy ra (R = 0).
- tp (Bi quan): Nếu rủi ro xảy ra. tp = tm + (Điểm rủi ro trung bình của Team).

**Áp dụng kỹ thuật kỹ thuật ước lượng Tham số:**

- nhóm sử dụng thuật toán nhân hệ số rủi ro (Risk Factor) dựa trên kết quả của Bảng đánh giá rủi ro đã thực hiện ở chương trước:
- nguyên tắc: tp = tm + (tm \* %RiskFactor) (Điểm rủi ro càng cao thì %RiskFactor càng lớn.)

| **Mức độ rủi ro (R)** | **Phân loại** | **Hệ số bù giờ** | **Ý nghĩa** |
| --- | --- | --- | --- |
| 1 - 3 | Thấp / Rất thấp | + 10% đến 20% | Cộng thêm khoảng 1 ngày. (Dành cho các lỗi nhỏ, fix nhanh). |
| 4 - 2 | Trung bình | + 30% đến 50% | Cộng thêm khoảng 2 - 3.2 ngày. (Dành cho các sự cố mất dữ liệu, thiếu exp). |
| 6 - 9 | Cao / Rất cao | + 60% đến 80% | Cộng thêm khoảng 4 - 6 ngày. (Dành cho sai estimate, vắng mặt key member). |
| > 10 | Nghiêm trọng | + 100% (Gấp đôi) | Cộng thêm 7 ngày trở lên. (Vỡ kế hoạch, làm lại từ đầu). |

####

####

#### ***4.4.2. Bảng các yếu tố thuận lợi***

Nguyên tắc: to = tm - (tm \* %Opportunity) (Yếu tố thuận lợi càng nhiều %Opportunity càng lớn.)

| **STT** | **Yếu tố thuận lợi (Cơ hội)** | **Chi tiết áp dụng thực tế** | **Tác động cụ thể** | **Đội ngũ hưởng lợi** |
| --- | --- | --- | --- | --- |
| 1 | Tái sử dụng tài nguyên có sẵn | - Có tài liệu khảo sát cũ tham khảo được ngay.  - Sử dụng các mẫu thiết kế (Design Patterns) có sẵn.  - Có sẵn các Module mẫu để tham khảo code.  - Tài liệu HDSD đã được soạn thảo một phần từ trước. | Giảm ~20-30% | Team 1  Team 2  Team 3  Team 5 |
| 2 | Chất lượng bàn giao nội bộ tốt | - Tài liệu phân tích từ Team 1 chuyển sang cực kỳ rõ ràng.  - Team 2 bàn giao Database Design chuẩn.  - Team 3 code chắc tay, Unit Test tốt, ít lỗi logic. | Giảm ~12-33% | Team 2  Team 3  Team 4 |
| 3 | Sự phản hồi từ Stakeholder (Khách hàng/GV) | - Khách hàng tại TLU phản hồi nhanh các thắc mắc.  - Sơ đồ Gantt và WBS được duyệt ngay, không phải sửa lại. | Giảm ~28-33% | Team 1 |
| 4 | Hạ tầng kỹ thuật ổn định | - Môi trường Server TLU đã sẵn sàng.  - Không gặp lỗi cấu hình khi deploy. | Giảm ~30% | Team 5 |

## **5. Lập lịch dự án sử dụng phương pháp PERT/CPM**

### **5.1. Công thức liên kết rủi ro**

#### ***5.1.1. Team 1: Tìm hiểu yêu cầu khách hàng và lập kế hoạch dự án (tm = 12 ngày)***

+ Công việc A:Thu thập yêu cầu (tm = 4 ngày)

- to (Lạc quan): 2 ngày (Nếu khách hàng tại TLU phản hồi nhanh, tài liệu cũ có sẵn).
- tp (Bi quan): 8 ngày (Vì rủi ro số 1 về ước lượng quá thấp là Cao, và khách hàng có thể thay đổi yêu cầu).

+ Công việc B: Phân tích yêu cầu(tm = 5 ngày)

- to (Lạc quan): 3 ngày (Nếu các tài liệu từ Team 1 cực kỳ rõ ràng).
- tp (Bi quan): 9 ngày (Nếu phát hiện các yêu cầu mâu thuẫn nhau trong các Needs).

+ Công việc C: Lập kế hoạch (tm = 2 ngày)

- to (Lạc quan): 1 ngày (Nếu sơ đồ Gantt và WBS được duyệt ngay).
- tp (Bi quan): 4 ngày (Nếu phải điều chỉnh lại nguồn lực nhiều lần).

Áp dụng công thức phân phối xác suất Beta te = $ \frac{(to + 4tm + tp)}{6}$ :

Với công việc A:

- te(A) = = 4.33 ngày

Với công việc B:

- te(B) = ngày

Với công việc C:

- te(B) = = 2.17 ngày

=> tổng thời gian kì vọng của team 1 là ~11.83 ngày

#### ***5.1.2. Team 2: Phân tích, đặc tả và thiết kế*** ***(tm = 11 ngày)***

- to (Lạc quan): 7 ngày (Nếu nhóm sử dụng các mẫu thiết kế có sẵn).
- tp (Bi quan): 18 ngày (Do rủi ro số 10 - thiếu kinh nghiệm công nghệ và rủi ro số 3 - khách hàng thay đổi yêu cầu).

Áp dụng công thức te = $ \frac{(to + 4tm + tp)}{6}$ :

Thời gian kỳ vọng (te):

- te(D) = = 11.5 ngày

#### ***5.1.3. Team 3: Lập trình (tm = 26 ngày)***

- to (Lạc quan): 20 ngày (Nếu Team 2 bàn giao Database Design chuẩn và Team 3 đã có sẵn các Module mẫu để tham khảo).
- tp (Bi quan): 38 ngày (Nếu phát sinh lỗi nghiêm trọng ở Module Lương hoặc Cấu hình hệ thống, cộng với việc thiếu kinh nghiệm về công nghệ mới).

Áp dụng công thức te = $ \frac{(to + 4tm + tp)}{6}$ :

Thời gian kỳ vọng (te):

- te = = 27 ngày

#### ***5.1.4. Team 4: Kiểm thử (tm = 14 ngày)***

- to (Lạc quan): 10 ngày (Nếu Team 3 code chắc tay, Unit Test tốt và không phát hiện lỗi logic nghiêm trọng).
- tp (Bi quan): 24 ngày (Nếu phát hiện lỗi "thảm khốc", buộc phải trả về cho Team 3 sửa lại toàn bộ).

Thời gian kỳ vọng (te):

- te = = 15 ngày

#### ***5.1.5. Team 5: Đóng gói, triển khai và viết tài liệu (tm = 8 ngày)***

- to (Lạc quan):5 ngày (Nếu môi trường server TLU đã sẵn sàng, không lỗi cấu hình và các tài liệu hướng dẫn đã được soạn thảo một phần từ các bước trước).
- tp (Bi quan):14 ngày (Nếu xảy ra lỗi server thảm khốc, mất dữ liệu khi import hoặc tài liệu HDSD bị trả lại do thiếu chi tiết).

Thời gian kỳ vọng (te):

- te = = 8.5 ngày

### **5.2. Bảng danh mục công việc**

| **Mã** | **Tên công việc** | **Tg** | **CV trước** | **ES** | **EF** | **LS** | **LF** | **Slack** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Xây dựng Kế hoạch quản lý yêu cầu | 1 |  | 1 | 1 | 1 | 1 | 0 |
| 1.2 | Khảo sát và thu thập yêu cầu | 2 | 1.1 | 2 | 3 | 2 | 3 | 0 |
| 1.3 | Lập tài liệu Yêu cầu và Tầm nhìn | 2 | 1.2 | 4 | 5 | 4 | 5 | 0 |
| 1.4 | Phân tích tính năng phần mềm | 1 | 1.3 | 6 | 6 | 6 | 6 | 0 |
| 1.5 | Thiết kế Sơ đồ Use Case tổng quát | 1 | 1.4 | 7 | 7 | 9 | 9 | 2 |
| 1.6 | Viết kịch bản Use Case chi tiết | 3 | 1.5 | 8 | 10 | 36 | 38 | 28 |
| 1.7 | Xác định yêu cầu phi chức năng | 1 | 1.4 | 7 | 7 | 38 | 38 | 31 |
| 1.8 | Tổng hợp Đặc tả Yêu cầu SRS | 1 | 1.6, 1.7 | 11 | 11 | 39 | 39 | 28 |
| 1.9 | Đánh giá rủi ro và lập dự phòng | 1 | 1.8 | 12 | 12 | 54 | 54 | 42 |
| 1.10 | Lập lịch trình dự án | 1 | 1.9 | 13 | 13 | 55 | 55 | 42 |
| 2.1 | Thiết kế Kiến trúc hệ thống | 2 | 1.4 | 7 | 8 | 7 | 8 | 0 |
| 2.2 | Mô hình hóa hệ thống nâng cao | 3 | 2.1 | 9 | 11 | 9 | 11 | 0 |
| 2.3 | Thiết kế cơ sở dữ liệu | 4 | 2.2 | 12 | 15 | 12 | 15 | 0 |
| 2.4 | Thiết kế giao diện UI UX | 4 | 1.5 | 8 | 11 | 10 | 13 | 2 |
| 2.5 | Chuẩn hóa Design System | 2 | 2.4 | 12 | 13 | 14 | 15 | 2 |
| 2.6 | Thiết kế đặc tả API | 2 | 2.3, 2.5 | 16 | 17 | 16 | 17 | 0 |
| 3.1 | Thiết lập môi trường phát triển | 2 | 2.1 | 9 | 10 | 16 | 17 | 7 |
| 3.2 | Xây dựng CSDL và migration | 2 | 2.3 | 16 | 17 | 16 | 17 | 0 |
| 3.3 | Code module Đăng nhập và Phân quyền | 3 | 3.1, 3.2, 2.6 | 18 | 20 | 18 | 20 | 0 |
| 3.4 | Code module Danh mục | 4 | 3.3 | 21 | 24 | 21 | 24 | 0 |
| 3.5 | Code module Cơ cấu tổ chức | 4 | 3.4 | 25 | 28 | 25 | 28 | 0 |
| 3.6 | Code module Hồ sơ nhân sự | 6 | 3.5 | 29 | 34 | 29 | 34 | 0 |
| 3.7 | Code module Đào tạo | 4 | 3.6 | 35 | 38 | 35 | 38 | 0 |
| 3.8 | Code Cổng thông tin nội bộ | 4 | 3.7 | 39 | 42 | 39 | 42 | 0 |
| 3.9 | Tích hợp Báo cáo thống kê | 3 | 3.8 | 43 | 45 | 43 | 45 | 0 |
| 3.10 | Thực hiện Unit Test | 2 | 3.9 | 46 | 47 | 46 | 47 | 0 |
| 4.1 | Lập Kế hoạch kiểm thử | 2 | 1.8 | 12 | 13 | 40 | 41 | 28 |
| 4.2 | Viết kịch bản kiểm thử | 4 | 4.1 | 14 | 17 | 42 | 45 | 28 |
| 4.3 | Kiểm thử chức năng | 2 | 4.2, 3.9 | 46 | 47 | 46 | 47 | 0 |
| 4.4 | Kiểm thử giao diện | 2 | 4.3 | 48 | 49 | 49 | 50 | 1 |
| 4.5 | Kiểm thử hiệu năng | 2 | 4.3 | 48 | 49 | 48 | 49 | 0 |
| 4.6 | Kiểm thử bảo mật | 2 | 4.3 | 48 | 49 | 48 | 49 | 0 |
| 4.7 | Test hồi quy và Fix Bug | 2 | 4.5, 4.6, 3.10 | 50 | 51 | 50 | 51 | 0 |
| 5.1 | Chuẩn bị máy chủ | 2 | 3.10 | 48 | 49 | 48 | 49 | 0 |
| 5.2 | Thiết lập quy trình CI CD | 2 | 5.1 | 50 | 51 | 50 | 51 | 0 |
| 5.3 | Viết tài liệu Hướng dẫn | 3 | 4.4 | 50 | 52 | 51 | 53 | 1 |
| 5.4 | Đóng gói và Deploy | 2 | 4.7, 5.2 | 52 | 53 | 52 | 53 | 0 |
| 5.5 | Đào tạo chuyển giao | 2 | 5.3, 5.4 | 54 | 55 | 54 | 55 | 0 |

###

### **5.3. Sơ đồ Gantt**

### **![Image: image_010](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_010.png)**

###

### **5.4. Đường găng**

![Image: image_011](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_011.png)

# **III. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG**

# **1. Biểu đồ hoạt động**

## **1.1. Biểu đồ hoạt đông UC: Đăng nhập**

**![Image: image_012](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_012.png)**

## **1.2. Biểu đồ hoạt đông UC: Đăng xuất**

**![Image: image_013](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_013.png)**

# **2. Biểu đồ tuần tự**

## **2.1. Biểu đồ tuần tự use case: Đăng nhập**

![Image: image_054](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_054.png)

## **2.2. Biểu đồ tuần tự use case: Đăng xuất**

![Image: image_055](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_055.png)

# **3. Thiết kế cơ sở dữ liệu**

![Image: image_086](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_086.png)

*Mô hình ERD*

## **3.1. Xác định thực thể:**

### 3.1.1. Thực thể và thuộc tính:

- NhanSu(maCanBo, hoTen, ngaySinh, gioiTinh, soCCCD, queQuan, diaChi, maSoThue,soBHXH,soBHYT, email, soDienThoai, anhChanDung, tinhDoVanHoa, trinhDoDaoTao,chucDanhNgheNghiep,chucDanhKhoaHoc,laNguoiNuocNgoai, trangThaiLamViec, trangThaiHopDong)
- TaiKhoan(email, matKhau, vaiTro, trangThaiTaiKhoan,maCanBo)
- DonViToChuc(maDonVi, tenDonVi, loaiDonVi, diaChi, diaChiVanPhong, email, soDienThoai, laDonViNut, website, trangThai,maCanBo)
- QuyetDinhDonVi(soQuyetDinh, ngayHieuLuc, ngayQuyetDinh, loaiSuKien, lyDo, fileDinhKem,maCanBo)
- ThongTinNguoiNuocNgoai(soVisa, soHoChieu, ngayHetHanVisa, ngayHetHanHoChieu, soGiayPhepLaoDong, ngayHetHanGPLD, fileGPLD,maCanBo)

### 3.1.2. Xác định mối liên hệ:

**Nhân sự - Có - Tài khoản: là kiểu liên kết 1:1**

- Mỗi nhân sự (Cán bộ) được cấp một tài khoản duy nhất để truy cập hệ thống thông qua Email công vụ, và một tài khoản chỉ thuộc về một nhân sự nhất định.
- Lực lượng tham gia của Nhân sự là bộ phận (có những nhân sự chưa được cấp hoặc không cần dùng tài khoản hệ thống).
- Lực lượng tham gia của Tài khoản là toàn bộ (mọi tài khoản sinh ra phải gắn với một nhân sự cụ thể).

**Nhân sự - Được bổ nhiệm vào - Đơn vị tổ chức: là kiểu liên kết 1:N**

- Một Đơn vị có thể quản lý nhiều nhân sự, nhưng mỗi nhân sự tại một thời điểm chỉ thuộc về một đơn vị công tác.
- Lực lượng tham gia của Đơn vị là bộ phận (đơn vị mới thành lập hoặc đơn vị quản lý cấp cao có thể chưa có nhân viên trực thuộc).
- Lực lượng tham gia của Nhân sự là toàn bộ (bất kỳ cán bộ nào khi vào làm việc đều phải được biên chế vào một đơn vị).

**Đơn vị Tổ chức - Có - Quyết định Đơn vị: là kiểu liên kết 1:N**

- Một đơn vị có thể trải qua nhiều sự kiện pháp lý (thành lập, sáp nhập, đổi tên) tương ứng với nhiều quyết định, nhưng một quyết định chỉ áp dụng cho một đơn vị duy nhất.
- Lực lượng tham gia của Đơn vị là bộ phận (có những đơn vị ổn định, chưa phát sinh quyết định thay đổi nào).
- Lực lượng tham gia của Quyết định là toàn bộ (mỗi quyết định ban hành phải dành cho một đơn vị cụ thể).

**Nhân sự - Là - Người nước ngoài: là kiểu liên kết 1:1**

- Đây là mối quan hệ mở rộng thông tin. Một nhân sự nếu là người nước ngoài sẽ có một bộ hồ sơ pháp lý riêng (Visa, Hộ chiếu, GPLĐ).
- Lực lượng tham gia của Nhân sự là bộ phận (chỉ những nhân sự có quốc tịch nước ngoài mới có thông tin này).
- Lực lượng tham gia của Thông tin người nước ngoài là toàn bộ (mỗi bộ hồ sơ Visa/GPLĐ phải thuộc về một nhân sự xác định).

**Nhân sự - Đăng ký - Khóa đào tạo: là kiểu liên kết M:N**

- Một nhân sự có thể tham gia nhiều khóa đào tạo khác nhau để nâng cao nghiệp vụ, và một khóa đào tạo có nhiều nhân sự theo học.
- Lực lượng tham gia của cả hai là bộ phận (nhân sự có thể chưa đi học khóa nào, và khóa đào tạo mới có thể chưa có người đăng ký).
- Thuộc tính riêng: "Trạng thái đăng ký", "Kết quả đào tạo".

## **3.3. Biểu đồ lớp:**

![Image: image_087](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_087.png)

## **3.4. Thiết kế CSDL ở mức vật lý**

### **3.4.1. Bảng employee\_family\_members (Gia đình nhân viên)**

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | Primary Key, Auto Increment | Khóa chính |
| employee\_id | BIGINT UNSIGNED | Foreign Key, Not Null | Tham chiếu đến employees.id |
| relation | VARCHAR(30) | Not Null | Mối quan hệ (Vợ, Chồng, Con...) |
| full\_name | NVARCHAR(255) | Not Null | Họ tên người thân |
| dob | DATE | Nullable | Ngày sinh |
| phone | VARCHAR(30) | Nullable | Số điện thoại |
| is\_dependent | TINYINT(1) | Default: 0 | Có phải người phụ thuộc không |
| created\_at | TIMESTAMP | Nullable | Thời điểm tạo |

### **3.4.2. Bảng employee\_degrees (Bằng cấp):**

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | Primary Key, Auto Increment | Khóa chính |
| employee\_id | BIGINT UNSIGNED | Foreign Key, Not Null | Tham chiếu đến employees.id |
| degree\_name | NVARCHAR(255) | Not Null | Tên bằng cấp (Cử nhân, Thạc sĩ...) |
| school | NVARCHAR(255) | Not Null | Tên trường cấp bằng |
| major | NVARCHAR(255) | Nullable | Chuyên ngành đào tạo |
| graduation\_year | INT | Nullable | Năm tốt nghiệp |
| degree\_file\_id | BIGINT UNSIGNED | Foreign Key | File đính kèm bằng cấp |

# **IV. KIỂM THỬ**

## **1. Mục tiêu kiểm thử**

Hoạt động kiểm thử phần mềm trong dự án Hệ thống Quản lý Nhân sự được triển khai nhằm đạt được các mục tiêu cốt lõi, mang tính định hướng chất lượng và đảm bảo giá trị sử dụng thực tiễn của hệ thống. Cụ thể như sau:

- Phát hiện và phòng ngừa sai sót (Defect Detection & Prevention): Mục tiêu là nhận diện, phân loại và ghi nhận các lỗi phát sinh trong suốt vòng đời phát triển phần mềm. Thông qua đó, nhóm phát triển có cơ sở để khắc phục và ngăn ngừa lỗi tái diễn trong các phiên bản tiếp theo.

- Đảm bảo chất lượng hệ thống (Quality Assurance): Cung cấp các bằng chứng định lượng và định tính về mức độ ổn định, tính chính xác và hiệu năng của hệ thống. Hoạt động kiểm thử đóng vai trò như một cơ chế đánh giá độc lập nhằm xác nhận phần mềm đạt tiêu chuẩn chất lượng trước khi triển khai thực tế.

- Xác nhận sự phù hợp với yêu cầu (Requirements Validation): Đảm bảo rằng hệ thống được xây dựng hoàn toàn phù hợp với đặc tả yêu cầu nghiệp vụ của Trường Đại học Thủy Lợi, đồng thời đáp ứng kỳ vọng sử dụng của các nhóm người dùng như cán bộ nhân sự, phòng kế toán và ban quản lý.

- Gia tăng mức độ tin cậy của khách hàng (Customer Confidence Building): Thông qua việc bàn giao một hệ thống vận hành ổn định, bảo mật và hiệu quả, hoạt động kiểm thử góp phần củng cố niềm tin của Nhà trường đối với sản phẩm phần mềm.

## **2. Các nguyên tắc cơ bản của kiểm thử**

Dự án áp dụng 7 nguyên tắc kiểm thử phần mềm chuẩn quốc tế:

### 1. Kiểm thử chỉ ra sự hiện diện của lỗi: Kiểm thử nhằm mục đích tìm lỗi chứ không thể khẳng định phần mềm 100% không có lỗi.
### 2. Kiểm thử toàn bộ là không thể: Thay vì thử mọi tổ hợp dữ liệu, tập trung vào các kịch bản dựa trên rủi ro và mức độ ưu tiên.
### 3. Kiểm thử càng sớm càng tốt: Thực hiện ngay từ giai đoạn phân tích đặc tả để giảm thiểu chi phí khắc phục.
### 4. Sự tập trung của lỗi: Lỗi thường tập trung ở một số module phức tạp.
### 5. Nghịch lý thuốc trừ sâu: Các bài kiểm tra lặp đi lặp lại sẽ mất khả năng tìm lỗi mới, cần cập nhật Test Case thường xuyên.
### 6. Kiểm thử phụ thuộc vào ngữ cảnh: Kiểm thử module "Hồ sơ nhân sự" sẽ khác hoàn toàn với kiểm thử "Phân quyền hệ thống".
### 7. Sự sai lầm về việc không có lỗi: Một hệ thống không có bug nhưng không đáp ứng được nhu cầu sử dụng thực tế thì vẫn là một dự án thất bại.

## **3. Quy trình kiểm thử**

Quy trình kiểm thử trong dự án được xây dựng theo hướng chuẩn hóa, đảm bảo tính hệ thống và khả năng kiểm soát. Các giai đoạn chính bao gồm:

- Lập kế hoạch kiểm thử (Test Planning): Xác định mục tiêu kiểm thử, phạm vi, chiến lược, nguồn lực (nhân sự, công cụ), lịch trình và tiêu chí chấp nhận.

- Giám sát và kiểm soát (Test Monitoring & Control): Theo dõi tiến độ thực hiện kiểm thử, so sánh với kế hoạch ban đầu, từ đó đưa ra các điều chỉnh kịp thời nhằm đảm bảo tiến độ và chất lượng.

- Phân tích và thiết kế kiểm thử (Test Analysis & Design): Chuyển đổi yêu cầu hệ thống thành các kịch bản kiểm thử (Test Scenarios) và thiết kế các trường hợp kiểm thử (Test Cases) chi tiết, bao gồm dữ liệu đầu vào, bước thực hiện và kết quả mong đợi.

- Thực thi kiểm thử (Test Execution): Tiến hành chạy các Test Case trên môi trường kiểm thử (staging environment), ghi nhận kết quả thực tế, so sánh với kết quả kỳ vọng và báo cáo lỗi (Defect Reporting).

- Đánh giá tiêu chí kết thúc (Exit Criteria Evaluation): Xác định mức độ hoàn thành kiểm thử dựa trên các tiêu chí như độ bao phủ, tỷ lệ lỗi còn tồn đọng, mức độ nghiêm trọng của lỗi.

- Kết thúc kiểm thử (Test Closure): Tổng hợp báo cáo kiểm thử, lưu trữ tài liệu, đánh giá hiệu quả quy trình và rút ra bài học kinh nghiệm cho các dự án tiếp theo.

## **4. Các phương pháp kiểm thử**

- Kiểm thử hộp đen (Black-box Testing): Kiểm tra chức năng dựa trên đầu vào/đầu ra mà không cần quan tâm đến code bên trong.

- Kiểm thử hộp trắng (White-box Testing): Kiểm tra cấu trúc logic bên trong mã nguồn, các câu lệnh điều kiện và vòng lặp.

- Kiểm thử theo kinh nghiệm (Experience-based Testing): Sử dụng kỹ năng và trải nghiệm của Senior QA để dự đoán các lỗi tiềm ẩn mà đặc tả chưa đề cập.

Giới hạn trong dự án Quản Lý Nhân Sự Trường Đại Học Thủy Lợi, phương pháp kiểm thử được kết hợp sử dụng là: Kiểm thử dựa trên kinh nghiệm (Experience-based Testing)

## **5. Phạm vi kiểm thử (Scope)**

Dựa trên đặc thù dự án Quản lý nhân sự Trường Đại học Thủy lợi, phạm vi bao gồm các tác nhân:

| **Tác nhân** | **Phạm vi chức năng kiểm thử chính** |
| --- | --- |
| Quản trị viên | 1. Quản trị Hệ thống & Tài khoản: Quản lý tài khoản người dùng (Tìm kiếm, Thêm, Sửa, Khóa/Mở khóa).  2. Quản trị Cơ cấu tổ chức: Thêm mới đơn vị, Sửa thông tin đơn vị, Thay đổi trạng thái (Giải thể/Sáp nhập).  3. Nhóm Cá nhân (Self-service): Đăng nhập, Đăng xuất, Đổi mật khẩu, Xem thông tin cá nhân, Xem thông tin đơn vị công tác, Đăng ký khóa đào tạo. |
| Phòng TCCB | 1. Quản lý Hồ sơ & Hợp đồng: Quản lý hồ sơ nhân sự (Thêm, Sửa, Tìm kiếm, Lọc, In, Xem chi tiết, Đánh dấu thôi việc), Thêm mới hợp đồng.  2. Nghiệp vụ Tổ chức & Đánh giá: Bổ nhiệm/Bãi nhiệm nhân sự vào đơn vị, Ghi nhận đánh giá khen thưởng/kỷ luật.  3. Quản lý Đào tạo: Mở khóa đào tạo, Chỉnh sửa, Xem thông tin khóa, Ghi nhận kết quả.  4. Quản lý Danh mục (Cấu hình): Quản lý cấu hình Hệ số lương (Thêm, Sửa, Xóa, Ngừng SD), Quản lý cấu hình Phụ cấp (Thêm, Sửa, Ngừng SD), Quản lý cấu hình Hợp đồng (Thêm, Sửa, Ngừng SD).  5. Báo cáo Thống kê: Xem các báo cáo thống kê nhân sự.  6. Nhóm Cá nhân: Đăng nhập, Đăng xuất, Đổi mật khẩu, Xem thông tin cá nhân, Xem thông tin đơn vị công tác, Đăng ký & Xem khóa đào tạo đã đăng ký. |
| Phòng TCKT | 1. Khai thác dữ liệu (Chỉ đọc): Xem chi tiết hồ sơ nhân sự, In hồ sơ nhân sự (phục vụ đối chiếu tính lương).  2. Báo cáo Thống kê: Xem các báo cáo thống kê nhân sự.  3. Nhóm Cá nhân: Đăng nhập, Đăng xuất, Đổi mật khẩu, Xem thông tin cá nhân, Xem thông tin đơn vị công tác, Đăng ký & Xem khóa đào tạo đã đăng ký. |
| Cán bộ | 1. Nhóm Cá nhân (Self-service): Đăng nhập, Đăng xuất (Tự động đăng xuất sau 30p), Đổi mật khẩu.  2. Xem thông tin: Xem thông tin trong hồ sơ cá nhân của mình, Xem thông tin chi tiết đơn vị đang công tác.  3. Đào tạo: Đăng ký khóa đào tạo, Xem danh sách các khóa đào tạo đã đăng ký. |

## **6. Tài liệu tham chiếu**

- Đặc tả (Specification): Tài liệu mô tả luồng nghiệp vụ và các quy định tính toán.

## **7. Công cụ kiểm thử (Tools)**

- Quản lý kế hoạch (Test Plan): Google Docs

- Thiết kế kịch bản (Test Case): Google Sheets

- Quản lý lỗi (Log Bug Tool): Google Sheets (Theo dõi ID, trạng thái, mức độ nghiêm trọng và tiến độ fix bug).

## **8. Tiêu chuẩn kiểm thử**

| Điều kiện bắt đầu thực hiện test | - Tài liệu Đặc tả yêu cầu (STRQ/FEAT) và Thiết kế giao diện (Figma) đã được chốt và phê duyệt.  - Đội ngũ Phát triển (Dev) đã hoàn thành việc code chức năng, thực hiện xong Unit Test và deploy mã nguồn lên môi trường Kiểm thử (Test Environment).  - Môi trường kiểm thử và Dữ liệu kiểm thử (Test Data) đã được thiết lập sẵn sàng.  - Danh sách Kịch bản kiểm thử (Test Cases) đã được review và phê duyệt. |
| --- | --- |
| Khi nào thì dừng test | * 100% các Test Case trong phạm vi (Scope) đã được thực thi (Executed). * Tỷ lệ Test Case đạt (Pass Rate) tối thiểu từ 95% trở lên. * Tuyệt đối KHÔNG CÒN lỗi ở mức độ Nghiêm trọng (Critical) và Cao (High). * Các lỗi ở mức độ Trung bình (Medium) hoặc Thấp (Low/Minor) còn tồn đọng (nếu có) phải có số lượng nằm trong ngưỡng cho phép và đã được Quản trị dự án (PM) hoặc Khách hàng chấp nhận rủi ro (Accepted Risks). |
| Tiêu chuẩn test thành công | - Đáp ứng được yêu cầu chức năng của phần mềm   * Phần mềm đáp ứng đúng và đủ 100% các yêu cầu tính năng (FEAT) và yêu cầu nghiệp vụ đã được định nghĩa trong tài liệu Đặc tả. * Tài liệu báo cáo tổng kết kiểm thử (Test Summary Report) được hoàn thiện và ký nghiệm thu. |

## **9. Kịch bản kiểm thử**

Kịch bản kiểm thử chi tiết : [PTDAPM\_Nhóm 3\_Team 4](https://docs.google.com/spreadsheets/d/12rX3kGvQpFdHMzz-gwhGLGRY6ao3SkBk_6RjYORaQMM/edit?usp=sharing)

9.1.Module Đăng nhập

| **Dự án** | | ***Quản Lý Nhân Sự Trường Đại Học Thủy Lợi*** | | | | | | | | | | | |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Mã Module** | | ***Đăng nhập*** | | | | | | | | | | | |
| **Tác nhân chính** | | ***Quản trị viên, Cán bộ TCCB, Cán bộ TCKT, Cán bộ nhân sự*** | | | | | | | | | | | |
| **Điều kiện tiên quyết** | | ***Người dùng đã được cấp tài khoản hợp lệ. Hệ thống đang hoạt động bình thường.*** | | | | | | | | | | | |
| **Tên kiểm thử viên** | | ***Nguyễn Văn Trường*** | | | | | | | | | | | |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **Tổng số TestCase** | | | **Đạt** | | | **Chưa đạt** | | | **Chưa kiểm tra** | | | | |
| **24** | | | **22** | | | **2** | | | **0** | | | | |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **ID** | **Mô tả trường hợp kiểm tra** | | **Các bước thực hiện** | | **Dữ liệu đầu vào** | **Kết quả mong đợi** | | **Lần kiểm thử** | | | | **Kết quả** | **Ghi chú** |
| **Lần 1** | **Lần 2** | **Lần 3** | **Lần 4** |
|
|  | ***Kiểm thử chức năng*** | | | | | | | | | | | | |
| FT\_DN\_06 | Đăng nhập thành công | | 1. Nhập Tên đăng nhập và Mật khẩu đúng  2. Nhấn nút "Đăng nhập" | | Tên đăng nhập: admin  Mật khẩu: admin123 | - Hiển thị thông báo "Đăng nhập thành công"  - Hệ thống chuyển hướng hiển thị giao diện Dashboard tương ứng | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_07 | Đăng nhập khi để trống dữ liệu | | 1. Không nhập gì vào 2 ô  2. Nhấn nút "Đăng nhập" | |  | - Hệ thống không gửi yêu cầu - Hiển thị 2 cảnh báo dưới mỗi textbox: "Vui lòng nhập tên đăng nhập" và "Vui lòng nhập mật khẩu" | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_08 | 1. Nhập thông tin vào ô Tên đăng nhập  2. Bỏ trống ô nhập Mật khẩu  3. Nhấn nút "Đăng nhập" | | Tên đăng nhập: admin | Hệ thống không gửi yêu cầu và hiển thị cảnh báo: "Vui lòng nhập mật khẩu". | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_09 | 1. Bỏ trống ô Tên đăng nhập  2. Nhập thông tin vào ô nhập Mật khẩu  3. Nhấn nút "Đăng nhập" | | Mật khẩu: admin123 | Hệ thống không gửi yêu cầu và hiển thị cảnh báo: "Vui lòng nhập tên đăng nhập". | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_10 | Đăng nhập sai dữ liệu | | 1. Nhập sai Tên đăng nhập  2. Nhập sai Mật khẩu  3. Nhấn nút "Đăng nhập" | | Tên đăng nhập: ad  Mật khẩu: ad | Hệ thống hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không đúng" | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_11 | 1. Nhập sai Tên đăng nhập  2. Nhập đúng Mật khẩu  3. Nhấn nút "Đăng nhập" | | Tên đăng nhập: ad  Mật khẩu: admin123 | Hệ thống hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không đúng" | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_12 | 1. Nhập đúng Tên đăng nhập  2. Nhập sai Mật khẩu  3. Nhấn nút "Đăng nhập" | | Tên đăng nhập: admin  Mật khẩu: admin | Hệ thống hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không đúng" | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_13 | Đăng nhập bằng tài khoản bị khóa (E2) | | 1. Nhập Tên đăng nhập và Mật khẩu đã bị khóa (Lock) trong hệ thống  2. Nhấn nút "Đăng nhập" | | Tên đăng nhập: tkkhoa  Mật khẩu: tkkhoa | Hệ thống hiển thị thông báo "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên". Không chuyển hướng đến Dashboard tương ứng | | Chưa đạt | Chưa đạt | Chưa đạt | Chưa đạt | Chưa đạt | - Kiểm tra ngày 02/04/2026 - lần 4 kết quả vẫn chưa đạt. Lí do: Hiển thị thông báo không giống đặc tả |
| FT\_DN\_14 | Đăng nhập khi đã có session hợp lệ (A1) | | 1. Đã đăng nhập thành công trước đó.  2. Tắt trình duyệt rồi mở lại link trang chủ | |  | - Người dùng truy cập trang đăng nhập khi đã có session hợp lệ,  - Hệ thống tự động chuyển hướng vào Dashboard. | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_15 | Kiểm tra phân quyền sau đăng nhập | | 1. Đăng nhập bằng tài khoản Quản trị viên.  2. Kiểm tra thanh Menu điều hướng. | |  | Chỉ hiển thị các chức năng liên quan đến Quản trị viên (Admin). | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DN\_16 | Trim khoảng trắng | | 1. Nhập có khoảng trắng đầu vào Tên đăng nhập 2. Nhập đúng Mật khẩu  3. Nhấn nút "Đăng nhập" | | Tên đăng nhập: <khoảng trắng>admin Mật khẩu: admin123 | - Hiển thị thông báo "Đăng nhập thành công"  - Hệ thống chuyển hướng hiển thị giao diện Dashboard tương ứng | | Chưa đạt | Chưa đạt | Chưa đạt | Chưa đạt | Chưa đạt | - Kiểm tra ngày 02/04/2026 - lần 4 hệ thống Hiển thị thông báo "Invalid username or password" không giống đặc tả |
|  | ***Kiểm thử Ngoại lệ/Phím tắt*** | | | | | | | | | | | | |
| EX\_DN\_17 | Kiểm tra phím Enter | | 1. Nhập Tên đăng nhập và Mật khẩu hợp lệ 2. Nhấn phím Enter trên bàn phím | | Tên đăng nhập: admin  Mật khẩu: admin123 | Hệ thống thực hiện lệnh đăng nhập thành công (tương đương nhấn chuột). | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| EX\_DN\_18 | Kiểm tra copy-paste vào ô Mật khẩu | | 1. Sao chép một chuỗi ký tự.  2. Dán vào ô Mật khẩu | | Chuỗi bất kỳ | Ô mật khẩu nhận dữ liệu và vẫn phải hiển thị dưới dạng ẩn (dấu chấm). | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| EX\_DN\_19 | Reload sau login | | 1. F5 dashboard | |  | Vẫn giữ session | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| EX\_DN\_20 | SQL Injection | | 1. Truy cập login  2. Nhập payload  3. Nhấn login | | Nhập: ' OR 1=1 | Không login | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| EX\_DN\_21 | XSS input | | 1. Truy cập login  2. Nhập script  3. Nhấn login | | <script> | Không thực thi | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| EX\_DN\_22 | Back sau login | | 1. Login thành công  2. Nhấn Back | |  | Không quay lại login | | Chưa đạt | Chưa đạt | Chưa đạt | Đạt | Đạt | Kiểm tra ngày 02/04/2026 - lần 4: Team code đã chỉnh sửa |
| EX\_DN\_23 | Button khi loading | | 1. Nhập đúng dữ liệu  2. Nhấn login  3. Quan sát button | |  | Button disable khi loading | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| EX\_DN\_24 | Đăng nhập sai nhiều lần | | 1. Nhập sai Tên đăng nhập và Mật khẩu nhiều lần 2. Nhấn "Đăng nhập" | |  | Hiển thị thông báo "Too many login attempts, please try again later" | | Đạt | Đạt | Đạt | Đạt | Đạt |  |

9.2. Module Đăng xuất

| **Dự án** | | ***Quản Lý Nhân Sự Trường Đại Học Thủy Lợi*** | | | | | | | | | | | |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Mã Module** | | ***Đăng xuất*** | | | | | | | | | | | |
| **Tác nhân chính** | | ***Quản trị viên, Cán bộ TCCB, Cán bộ TCKT, Cán bộ nhân sự*** | | | | | | | | | | | |
| **Điều kiện tiên quyết** | | ***Người dùng đang trong phiên đăng nhập hợp lệ*** | | | | | | | | | | | |
| **Tên kiểm thử viên** | | ***Nguyễn Văn Trường*** | | | | | | | | | | | |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **Tổng số TestCase** | | | **Đạt** | | | **Chưa đạt** | | | **Chưa kiểm tra** | | | | |
| **9** | | | **8** | | | **1** | | | **0** | | | | |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **ID** | **Mô tả trường hợp kiểm tra** | | **Các bước thực hiện** | | **Dữ liệu đầu vào** | **Kết quả mong đợi** | | **Lần kiếm thử** | | | | **Kết quả** | **Ghi chú** |
| **Lần 1** | **Lần 2** | **Lần 3** | **Lần 4** |
|
|  | ***Kiểm tra chức năng*** | | | | | | | | | | | | |
| FT\_DX\_03 | Đăng xuất thành công | | 1. Click avatar 2. Nhấn "Đăng xuất"  3. Chọn "Xác nhận" trên hộp thoại | |  | Session bị hủy, hệ thống chuyển hướng người dùng về trang Đăng nhập. | | Chưa đạt | Chưa đạt | Chưa đạt | Đạt | Đạt | - Kiểm tra ngày 02/04/2026 - lần 4: Team code đã chỉnh sửa |
| FT\_DX\_04 | Hủy thao tác đăng xuất | | 1. Nhấn "Đăng xuất"  2. Chọn "Hủy" trên hộp thoại | |  | Hộp thoại đóng lại, người dùng vẫn ở nguyên trang hiện tại, session vẫn duy trì. | | Chưa đạt | Chưa đạt | Chưa đạt | Đạt | Đạt | - Kiểm tra ngày 02/04/2026 - lần 4: Team code đã chỉnh sửa |
| FT\_DX\_05 | Kiểm tra Đăng xuất tự động (A1) | | 1. Đăng nhập vào hệ thống.  2. Để hệ thống ở trạng thái rảnh (không thao tác) trong 30 phút. | | Thời gian rảnh > 30p | Hệ thống tự động hủy session, thông báo "Phiên làm việc đã hết hạn" và đẩy về trang Đăng nhập. | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| FT\_DX\_06 | Kiểm tra tính an toàn của Session | | 1. Đăng xuất thành công.  2. Nhấn nút "Back" trên trình duyệt. | |  | Hệ thống không được quay lại trang Dashboard mà phải giữ nguyên ở trang Đăng nhập | | Đạt | Đạt | Đạt | Chưa đạt | Chưa đạt | - Kiểm tra ngày 02/04/ 2026 - lần 4: Hệ thống quay trở lại trang Dashboard |
| FT\_DX\_07 | Truy cập link trực tiếp sau khi đăng xuất | | 1. Đăng xuất thành công.  2. Nhập trực tiếp URL của trang Dashboard vào thanh địa chỉ. | |  | Hệ thống từ chối truy cập và chuyển hướng về trang Đăng nhập. | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
|  | ***Kiểm tra ngoại lệ/Đa phiên*** | | | | | | | | | | | | |
| EX\_DX\_08 | Đăng xuất trên một tab (Đa tab) | | 1. Mở hệ thống trên 2 tab trình duyệt.  2. Thực hiện đăng xuất ở Tab 1. | |  | Tại Tab 2, khi người dùng thực hiện một thao tác bất kỳ, hệ thống phải yêu cầu đăng nhập lại. | | Đạt | Đạt | Đạt | Đạt | Đạt |  |
| EX\_DX\_09 | Reload sau logout | | 1. Logout  2. Nhấn F5 | |  | Vẫn ở login | | Đạt | Đạt | Đạt | Đạt | Đạt |  |

# **V. Đóng gói**

## **1. Triển khai hệ thống**

### **1.1. Mục đích tài liệu**

Tài liệu này trình bày đầy đủ phương án triển khai hệ thống **Quản lý nhân sự Trường Đại học Thủy Lợi** trong môi trường Amazon Web Services, với EC2 đóng vai trò tầng ứng dụng và Amazon RDS PostgreSQL đóng vai trò tầng dữ liệu. Nội dung được tổng hợp từ các tài liệu triển khai nội bộ và kinh nghiệm xử lý các sự cố đã phát sinh trong quá trình đưa hệ thống vào môi trường chạy thật.

Mục tiêu của tài liệu là hỗ trợ ba nhu cầu đồng thời: triển khai ban đầu, bàn giao cho người tiếp nhận và vận hành hệ thống sau triển khai. Vì vậy, ngoài phần mô tả kiến trúc, tài liệu còn nêu rõ các bước cài đặt, quy trình build và deploy, các yêu cầu về phân quyền cơ sở dữ liệu, cơ chế backup và những điểm cần kiểm tra khi xảy ra lỗi.

### **1**.2**. Thông tin cơ bản**

Tên hệ thống: **Hệ thống Quản lý Nhân sự Trường Đại học Thủy Lợi**

(Tên viết tắt**: HRMS - Human Resources Management System**)

Hệ thống được phát triển trong khuôn khổ đồ án kết thúc môn “Phát triển Dự án Phần mềm” của nhóm 3, Khoa Công nghệ Thông tin, Trường Đại học Thủy Lợi.

#### **1.**2**.1. Mục tiêu chính của hệ thống**

- Hỗ trợ giảng viên, cán bộ quản lý hồ sơ cá nhân, tra cứu đơn vị công tác, đăng ký tham gia các khóa đào tạo hiện có một cách dễ dàng.
- Hỗ trợ Phòng Tổ chức Cán bộ và Phòng Tài chính Kế toán quản lý, phê duyệt, theo dõi và báo cáo về Hồ sơ nhân sự & Cơ cấu tổ chức một cách hiệu quả.

#### **1.**2**.2 Đối tượng sử dụng**

- Giảng viên / Cán bộ: Đăng nhập để quản lý hồ sơ cá nhân, tra cứu đơn vị công tác, đăng ký sự kiện & khóa đào tạo.
- Quản trị viên: Quản lý toàn bộ hệ thống, quản lý hồ sơ nhân sự & cơ cấu tổ chức, phê duyệt sự kiện & khóa đào tạo, xuất báo cáo thống kê.

#### **1.**2**.3. Công nghệ sử dụng**

- Hệ thống web-based (truy cập qua trình duyệt).
- Frontend: React/Vite.
- Backend: Elysia.
- Cơ sở dữ liệu: PostgreSQL.

#### **1.**2**.4. Môi trường triển khai**

- Hệ thống chạy trên trình duyệt web phổ biến (Google Chrome, Microsoft Edge, Firefox, Safari, v.v..).
- Không yêu cầu cài đặt phần mềm bổ sung.
- Có thể truy cập từ mạng nội bộ trường hoặc internet công cộng.

Hệ thống được thiết kế theo nguyên tắc thân thiện với người dùng, đảm bảo bảo mật thông tin và tuân thủ các quy chế khoa học của Trường Đại học Thủy Lợi.

### **1.**3**. Mô hình vận hành**

Phương án phù hợp cho hệ thống là mô hình triển khai trên máy chủ EC2 và cơ sở dữ liệu Amazon RDS PostgreSQL trong cùng một môi trường đám mây ảo. EC2 chỉ chịu trách nhiệm chạy frontend tĩnh, backend runtime, nginx; còn cơ sở dữ liệu được đặt trên Amazon RDS.

Điểm thuận lợi của việc sử dụng mô hình như trên là: giảm tải gánh nặng cho EC2, hạn chế rủi ro khi build và database cùng tranh chấp CPU hoặc bộ nhớ, đồng thời tận dụng khả năng sao lưu và quản trị dữ liệu sẵn có của Amazon RDS. Với phạm vi đồ án, đây là mô hình cân bằng tốt giữa chi phí và độ ổn định.

- 01 máy chủ Ubuntu EC2 để chạy frontend tĩnh, backend runtime và nginx.
- 01 Amazon RDS PostgreSQL để lưu dữ liệu production.
- Nginx trên EC2 phục vụ frontend và reverse proxy các route /auth và /api tới backend.
- systemd quản lý tiến trình backend và tự khởi động lại khi có sự cố.
- GitHub Actions đảm nhận build và tạo artifact.
- Artifact được chuyển lên EC2 bằng rsync.

### **1.**4**. Vai trò từng thành phần hệ thống**

#### **1.**4**.1. Thành phần chạy trên EC2**

- Thư mục frontend static: /srv/hrms/app/apps/frontend/dist.
- Thư mục backend runtime: /srv/hrms/app/apps/backend/dist.
- Nginx reverse proxy cho lưu lượng HTTP/HTTPS.
- Bun runtime để chạy backend và migration.
- Các tệp cấu hình triển khai như .env, unit file của systemd và cấu hình nginx.

#### **1.**4**.2. Thành phần chạy trên RDS**

- Lưu trữ dữ liệu PostgreSQL.
- Cung cấp endpoint kết nối cho DATABASE\_URL.
- Hỗ trợ backup tự động, snapshot thủ công và các thao tác quản trị dữ liệu.
- Cho phép tách biệt quyền giữa master user và application user.

#### **1.**4**.3. Thành phần chạy trên CI runner**

- Cài các gói cần thiết và chạy type-check, lint, build.
- Tạo artifact frontend và backend để deploy lên máy chủ.
- Đóng vai trò xây dựng chính thay cho máy chủ EC2.
- Đồng bộ các tệp cần thiết lên EC2 và kích hoạt quy trình deploy.

### **1.**5**. Kết quả sau triển khai**

Hệ thống đã được triển khai trên một máy chủ EC2 tại địa chỉ IP sau: <http://3.23.53.28/>

Vì lý do giới hạn về mặt chi phí và nhân lực, hệ thống hiện chỉ có thể truy cập được qua địa chỉ IP công cộng. Tuy nhiên, việc triển khai trên một tên miền thật và có chứng chỉ TLS hợp lệ rất đơn giản, chỉ cần cập nhật giá trị của các biến trong tệp .env: BETTER\_AUTH\_URL, FRONTEND\_URL và VITE\_API\_URL

### **1.**6**. Tự động hóa bằng Github Actions**

GitHub Actions được sử dụng cho mô hình triển khai này vì việc build có thể được thực hiện ngoài EC2, khi đó EC2 chỉ tiếp nhận artifact và chạy bước vận hành cuối cùng.

Việc sử dụng Github Actions thay vì build thủ công trên máy tính cá nhân và đồng bộ lên máy chủ EC2 bằng rsync sẽ làm giảm đáng kể thời gian triển khai các bản vá hoặc cập nhật tính năng mới, đồng thời sẽ giúp tối ưu hóa quá trình triển khai, tránh gặp phải các lỗi do con người hoặc lỗi khác (mất internet trong quá trình triển khai, máy tính gặp sự cố khi đang trong quá trình triển khai, v.v..).

#### **1.**6**.1. Luồng hoạt động của CI/CD pipeline**

##### 1. Checkout mã nguồn từ repository.
##### 2. Cài đặt Bun và các gói cần thiết.
##### 3. Khởi tạo cây TanStack router.
##### 4. Chạy type check.
##### 5. Chạy lint ở chế độ báo cáo, cho phép chạy tiếp nếu gặp lỗi về formatting.
##### 6. Build frontend với APP\_PUBLIC\_ORIGIN và build backend.
##### 7. Dùng rsync để đồng bộ repository payload và dist artifacts lên EC2.
##### 8. SSH vào EC2 để copy .env, chạy bun install khi cần, chạy db:migrate, restart backend và reload nginx.

## **2. Hướng dẫn sử dụng hệ thống**

### 2.1 Mục tiêu

Tài liệu này được xây dựng nhằm hướng dẫn người dùng sử dụng Hệ thống Quản lý Nhân sự một cách đầy đủ, rõ ràng và có hệ thống. Nội dung tài liệu trình bày cách truy cập hệ thống, cách sử dụng từng phân hệ chức năng và các bước thao tác cơ bản dành cho người dùng lần đầu tiếp cận hệ thống.

Tài liệu đồng thời là cơ sở minh chứng khả năng vận hành thực tế của hệ thống trong báo cáo đồ án hoặc khóa luận.

### **2.2 Đối tượng sử dụng**

Hệ thống được thiết kế cho các nhóm người dùng sau:

#### 1. Quản trị viên hệ thống.
#### 2. Cán bộ tổ chức cán bộ.
#### 3. Nhân viên.

Tùy theo vai trò đăng nhập, hệ thống sẽ hiển thị các chức năng tương ứng.

### 2.3 Môi trường vận hành

Hệ thống được chạy trên môi trường web và truy cập thông qua trình duyệt.

Thông tin môi trường:

#### 1. Địa chỉ truy cập: http://3.23.53.28/
#### 2. Trình duyệt khuyến nghị:

- Google Chrome
- Microsoft Edge

#### 3. Điều kiện hoạt động:

- Frontend đang chạy
- Backend đang chạy
- Cơ sở dữ liệu Amazon RDS đang hoạt động

### **2.4 Tài khoản sử dụng thử**

#### 1. Tài khoản quản trị viên:

- Tên đăng nhập: [admin]
- Mật khẩu: [admin123]

#### 2. Tài khoản cán bộ tổ chức cán bộ:

- Tên đăng nhập: [tccb\_user]
- Mật khẩu: [tccb1234]

#### 3. Tài khoản nhân viên:

- Tên đăng nhập: [employee\_user]
- Mật khẩu: [employee1234]

### **2.5 Quy trình đăng nhập hệ thống**

Người dùng thực hiện các bước sau:

#### 1. Mở trình duyệt web.
#### 2. Truy cập địa chỉ hệ thống.
#### 3. Nhập tên đăng nhập và mật khẩu.
#### 4. Nhấn nút Đăng nhập.
#### 5. Sau khi đăng nhập thành công, hệ thống chuyển tới trang chủ.

Chú thích hình: Giao diện đăng nhập hệ thống

### 2.6 Tổng quan giao diện hệ thống

Sau khi đăng nhập thành công, giao diện hệ thống gồm các thành phần chính:

#### 1. Thanh menu bên trái:

- Hiển thị các chức năng mà người dùng được phép truy cập.

#### 2. Thanh tiêu đề phía trên:

- Hiển thị breadcrumb và menu người dùng.

#### 3. Khu vực nội dung chính:

- Hiển thị thông tin chi tiết của từng chức năng.

#### 4. Menu người dùng:

- Cho phép đổi mật khẩu và đăng xuất.

![Image: image_089](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_089.png)

### 2.7 Hướng dẫn sử dụng theo từng chức năng

#### 2.7.1 Chức năng thống kê tổng quan

Chức năng này hỗ trợ người dùng theo dõi nhanh tình hình nhân sự toàn hệ thống.

Các bước sử dụng:

##### 1. Truy cập Trang chủ.
##### 2. Quan sát các thẻ thống kê:

- Tổng số nhân sự ⬤
- Tổng số đơn vị tổ chức ⬤
- Số lượng nhân sự đang công tác ⬤

##### 3. Theo dõi các biểu đồ thống kê:

- Theo trạng thái công tác ⬤
- Theo trạng thái hợp đồng ⬤
- Theo giới tính ⬤
- Theo trình độ học vấn ⬤
- Theo đơn vị tổ chức ⬤
- Theo học hàm ⬤

![Image: image_090](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_090.png)

![Image: image_091](./PTDAPM_Quản%20Lý%20Nhân%20Sự%20Trường%20Đại%20Học%20Thủy%20Lợi_images/image_091.png)

### 2.10. Kết luận

Hệ thống Quản lý Nhân sự đã đáp ứng tốt các yêu cầu cơ bản trong quản lý hồ sơ nhân sự, tài khoản, đơn vị tổ chức và đào tạo. Việc tổ chức chức năng theo từng phân hệ và hướng dẫn thao tác cụ thể giúp người dùng dễ dàng tiếp cận, khai thác và sử dụng hệ thống trong thực tế.

# **Kết luận**

Sau khi hoàn thành bài tập lớn này, chúng em đã nắm bắt và hiểu rõ hơn những kiến thức cốt lõi của môn học *Phát triển dự án phần mềm*, đặc biệt là quy trình phân tích yêu cầu khách hàng trong việc xây dựng phần mềm. Thông qua đề tài quản lý nhân sự Trường Đại học Thủy Lợi, chúng em đã có cơ hội vận dụng các kiến thức lý thuyết đã học để tiếp cận, phân tích và mô hình hóa một bài toán thực tế trong môi trường giáo dục đại học.

Những kết quả đạt được trong bài tập lớn là bước khởi đầu giúp chúng em hệ thống hóa kiến thức, rèn luyện tư duy phân tích và nâng cao khả năng làm việc nhóm. Việc kết hợp nội dung môn học này với các môn chuyên ngành khác sẽ là nền tảng quan trọng, hỗ trợ chúng em áp dụng hiệu quả vào học tập cũng như công việc trong tương lai.

# **Lời cảm ơn**

Nhóm chúng em xin gửi lời cảm ơn chân thành đến **thầy Cù Việt Dũng** đã hướng dẫn, truyền đạt một số kiến thức và kinh nghiệm trong quá trình thực hiện bài tập lớn. Những góp ý và chỉ dẫn của thầy đã giúp chúng em định hướng đúng đắn và hoàn thiện hơn nội dung phân tích yêu cầu của đề tài.

Do thời gian và kinh nghiệm còn hạn chế, bài làm của nhóm chúng em khó tránh khỏi những thiếu sót. Chúng em rất mong nhận được sự cảm thông, góp ý và nhận xét từ thầy để đề tài được hoàn thiện hơn.

Nhóm chúng em xin trân trọng cảm ơn!
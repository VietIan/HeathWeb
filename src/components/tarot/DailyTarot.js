'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './DailyTarot.module.css';

// All 78 Tarot cards with Vietnamese meanings
const TAROT_CARDS = [
    // MAJOR ARCANA (22)
    { id: "major_00", name: "The Fool (Chàng Khờ)", keywords: "Khởi đầu, Ngây thơ, Tự do", meaning_upright: "Một chặng đường mới đang mở ra. Hãy dấn thân với tâm thế cởi mở, không sợ hãi. Đôi khi, sự ngây thơ chính là sức mạnh.", meaning_reversed: "Cẩn thận với sự bốc đồng. Bạn đang lao vào rủi ro mà chưa suy tính kỹ hậu quả.", image: "/tarot/the_fool.png" },
    { id: "major_01", name: "The Magician (Nhà Ảo Thuật)", keywords: "Năng lực, Hiện thực hóa, Tập trung", meaning_upright: "Bạn có đủ mọi nguồn lực và kỹ năng để biến ước mơ thành hiện thực. Hãy tập trung ý chí, mọi thứ nằm trong tay bạn.", meaning_reversed: "Thiếu tự tin hoặc bị phân tâm. Bạn có tài năng nhưng chưa biết cách sử dụng đúng chỗ.", image: "/tarot/the_magician.png" },
    { id: "major_02", name: "The High Priestess (Nữ Tu Tối Cao)", keywords: "Trực giác, Bí ẩn, Tiềm thức", meaning_upright: "Hãy lắng nghe tiếng nói bên trong. Câu trả lời không nằm ở thế giới bên ngoài, mà nằm trong trực giác của bạn.", meaning_reversed: "Bạn đang phớt lờ cảm nhận của chính mình và chỉ chạy theo những ồn ào bên ngoài.", image: "/tarot/the_high_priestess.png" },
    { id: "major_03", name: "The Empress (Hoàng Hậu)", keywords: "Sáng tạo, Nuôi dưỡng, Sung túc", meaning_upright: "Một giai đoạn tràn đầy năng lượng sáng tạo và yêu thương. Hãy chăm sóc bản thân và tận hưởng vẻ đẹp của cuộc sống.", meaning_reversed: "Cảm thấy trống rỗng hoặc thiếu sức sống. Bạn đang bỏ bê việc chăm sóc chính mình.", image: "/tarot/the_empress.png" },
    { id: "major_04", name: "The Emperor (Hoàng Đế)", keywords: "Kỷ luật, Cấu trúc, Lãnh đạo", meaning_upright: "Đã đến lúc thiết lập trật tự và kỷ luật. Một nền tảng vững chắc sẽ giúp bạn tiến xa hơn.", meaning_reversed: "Sự cứng nhắc và bảo thủ đang kìm hãm bạn. Đừng cố kiểm soát mọi thứ quá mức.", image: "/tarot/the_emperor.png" },
    { id: "major_05", name: "The Hierophant (Giáo Hoàng)", keywords: "Niềm tin, Học hỏi, Truyền thống", meaning_upright: "Tìm kiếm lời khuyên từ những người đi trước hoặc đi theo những giá trị truyền thống đã được kiểm chứng.", meaning_reversed: "Đã đến lúc phá vỡ những lề thói cũ. Hãy tự tìm ra con đường riêng phù hợp với bạn.", image: "/tarot/the_hierophant.png" },
    { id: "major_06", name: "The Lovers (Tình Nhân)", keywords: "Tình yêu, Lựa chọn, Hòa hợp", meaning_upright: "Sự hòa hợp trong các mối quan hệ. Một quyết định quan trọng cần được đưa ra dựa trên tiếng gọi của trái tim.", meaning_reversed: "Mâu thuẫn nội tâm hoặc bất đồng trong quan hệ. Bạn đang đứng giữa ngã ba đường.", image: "/tarot/the_lovers.png" },
    { id: "major_07", name: "The Chariot (Cỗ Xe)", keywords: "Ý chí, Chiến thắng, Tiến lên", meaning_upright: "Hãy giữ vững tay lái và tập trung vào mục tiêu. Ý chí kiên cường sẽ giúp bạn vượt qua mọi chướng ngại vật.", meaning_reversed: "Mất kiểm soát. Bạn đang lao đi quá nhanh hoặc đi sai hướng. Hãy chậm lại.", image: "/tarot/the_chariot.png" },
    { id: "major_08", name: "Strength (Sức Mạnh)", keywords: "Kiên nhẫn, Nội lực, Dịu dàng", meaning_upright: "Sức mạnh thực sự đến từ sự bình tĩnh và lòng trắc ẩn, không phải nắm đấm. Hãy kiên nhẫn với chính mình.", meaning_reversed: "Bạn đang để nỗi sợ hãi hoặc sự nóng giận chi phối. Hãy hít thở sâu để tìm lại cân bằng.", image: "/tarot/strength.png" },
    { id: "major_09", name: "The Hermit (Ẩn Sĩ)", keywords: "Cô độc, Suy ngẫm, Tìm kiếm", meaning_upright: "Hãy dành thời gian một mình để suy ngẫm. Câu trả lời bạn tìm kiếm đang nằm sâu bên trong tâm hồn bạn.", meaning_reversed: "Sự cô lập đang trở nên tiêu cực. Đừng tự giam mình quá lâu, hãy kết nối lại với thế giới.", image: "/tarot/the_hermit.png" },
    { id: "major_10", name: "Wheel of Fortune (Bánh Xe Vận Mệnh)", keywords: "May mắn, Thay đổi, Chu kỳ", meaning_upright: "Mọi thứ đang xoay chuyển. Một cơ hội bất ngờ hoặc vận may đang đến. Hãy linh hoạt đón nhận.", meaning_reversed: "Gặp chút xui xẻo hoặc thay đổi không mong muốn. Hãy nhớ rằng đây chỉ là một giai đoạn tạm thời.", image: "/tarot/the_wheel_of_fortune.png" },
    { id: "major_11", name: "Justice (Công Lý)", keywords: "Công bằng, Sự thật, Nhân quả", meaning_upright: "Gieo nhân nào gặt quả nấy. Hãy nhìn nhận vấn đề một cách khách quan và trung thực nhất.", meaning_reversed: "Có sự bất công hoặc bạn đang tự dối lòng mình. Hãy chịu trách nhiệm cho hành động của bản thân.", image: "/tarot/justice.png" },
    { id: "major_12", name: "The Hanged Man (Người Treo Ngược)", keywords: "Hy sinh, Góc nhìn mới, Buông bỏ", meaning_upright: "Khi bế tắc, hãy thử nhìn cuộc đời ở một góc độ khác. Đôi khi cần lùi một bước để tiến ba bước.", meaning_reversed: "Bạn đang ngoan cố và không chịu thay đổi, dẫn đến sự hy sinh vô ích.", image: "/tarot/the_hanged_man.png" },
    { id: "major_13", name: "Death (Tử Thần)", keywords: "Kết thúc, Chuyển mình, Tái sinh", meaning_upright: "Đừng sợ hãi. Một cánh cửa khép lại để cánh cửa khác mở ra. Hãy buông bỏ những gì đã cũ để đón nhận cái mới.", meaning_reversed: "Sự sợ hãi thay đổi đang kìm hãm bạn. Đừng cố níu kéo những gì đã kết thúc.", image: "/tarot/the_death.png" },
    { id: "major_14", name: "Temperance (Sự Điều Độ)", keywords: "Cân bằng, Kiên nhẫn, Chữa lành", meaning_upright: "Hãy tìm điểm cân bằng trong cuộc sống. Sự nóng vội lúc này không giải quyết được gì. Hãy từ tốn.", meaning_reversed: "Cuộc sống đang mất cân bằng. Bạn đang làm quá nhiều hoặc quá ít. Hãy điều chỉnh lại nhịp độ.", image: "/tarot/temperance.png" },
    { id: "major_15", name: "The Devil (Ác Quỷ)", keywords: "Ràng buộc, Cám dỗ, Vật chất", meaning_upright: "Bạn đang bị trói buộc bởi những thói quen xấu hoặc nỗi sợ vô hình. Nhận diện nó là bước đầu để giải thoát.", meaning_reversed: "Dấu hiệu của sự tự do. Bạn đang bắt đầu phá vỡ xiềng xích và tìm lại quyền kiểm soát.", image: "/tarot/the_devil.png" },
    { id: "major_16", name: "The Tower (Tòa Tháp)", keywords: "Đổ vỡ, Thức tỉnh, Bất ngờ", meaning_upright: "Một sự thay đổi đột ngột làm đảo lộn mọi thứ. Dù đau đớn, nhưng nó cần thiết để phá vỡ những nền tảng giả tạo.", meaning_reversed: "Bạn đang cố che đậy một vấn đề sắp nổ tung. Thà đối mặt ngay bây giờ còn hơn kéo dài nỗi đau.", image: "/tarot/the_tower.png" },
    { id: "major_17", name: "The Star (Ngôi Sao)", keywords: "Hy vọng, Cảm hứng, Bình yên", meaning_upright: "Sau cơn mưa trời lại sáng. Niềm tin và hy vọng đang quay trở lại. Hãy tin vào tương lai tươi sáng.", meaning_reversed: "Cảm thấy tuyệt vọng hoặc thiếu niềm tin vào bản thân. Đừng để bóng tối che khuất ánh sáng trong bạn.", image: "/tarot/the_star.png" },
    { id: "major_18", name: "The Moon (Mặt Trăng)", keywords: "Lo âu, Mơ hồ, Trực giác", meaning_upright: "Mọi thứ không như vẻ bề ngoài. Hãy cẩn trọng với những ảo ảnh và lắng nghe trực giác mách bảo.", meaning_reversed: "Bóng tối đang dần tan biến. Sự thật bắt đầu được phơi bày và nỗi sợ hãi giảm bớt.", image: "/tarot/the_moon.png" },
    { id: "major_19", name: "The Sun (Mặt Trời)", keywords: "Niềm vui, Thành công, Rạng rỡ", meaning_upright: "Mọi thứ đều tuyệt vời! Năng lượng tích cực và niềm vui đang tràn ngập. Hãy tận hưởng khoảnh khắc này.", meaning_reversed: "Vẫn có niềm vui nhưng bạn đang không cảm nhận được nó trọn vẹn, hoặc quá lạc quan tếu.", image: "/tarot/the_sun.png" },
    { id: "major_20", name: "Judgement (Phán Xét)", keywords: "Đánh giá, Tái sinh, Tiếng gọi", meaning_upright: "Đã đến lúc nhìn lại quá khứ để rút ra bài học và nâng cấp bản thân lên một phiên bản mới tốt hơn.", meaning_reversed: "Bạn đang trốn tránh việc tự kiểm điểm hoặc mãi dằn vặt vì những sai lầm cũ.", image: "/tarot/judugement.png" },
    { id: "major_21", name: "The World (Thế Giới)", keywords: "Hoàn thành, Trọn vẹn, Thành tựu", meaning_upright: "Một chương của cuộc đời đã khép lại viên mãn. Bạn đã hoàn thành xuất sắc bài học của mình.", meaning_reversed: "Bạn ở rất gần đích đến nhưng vẫn thiếu một chút gì đó để trọn vẹn. Hãy cố gắng thêm chút nữa.", image: "/tarot/the_world.png" },

    // WANDS (14) 
    { id: "wands_01", name: "Ace of Wands", keywords: "Cảm hứng, Khởi đầu", meaning_upright: "Một tia lửa đam mê mới vừa nảy sinh. Đừng chần chừ, hãy nắm bắt cơ hội này ngay.", meaning_reversed: "Thiếu động lực hoặc ý tưởng bị dập tắt ngay từ trong trứng nước.", image: "/tarot/ace_of_wands.png" },
    { id: "wands_02", name: "Two of Wands", keywords: "Kế hoạch, Tầm nhìn", meaning_upright: "Bạn đang đứng trước những lựa chọn cho tương lai. Hãy lập kế hoạch và nhìn xa trông rộng.", meaning_reversed: "Sợ hãi rủi ro nên không dám bước ra khỏi vùng an toàn.", image: "/tarot/two_of_wands.png" },
    { id: "wands_03", name: "Three of Wands", keywords: "Mở rộng, Chờ đợi", meaning_upright: "Những nỗ lực của bạn đang bắt đầu vươn xa. Hãy kiên nhẫn chờ đợi thuyền về bến.", meaning_reversed: "Gặp trở ngại hoặc sự chậm trễ khiến bạn nản lòng.", image: "/tarot/three_of_wands.png" },
    { id: "wands_04", name: "Four of Wands", keywords: "Ăn mừng, Hạnh phúc", meaning_upright: "Thời điểm để nghỉ ngơi và ăn mừng những thành quả bước đầu. Hạnh phúc bên gia đình/bạn bè.", meaning_reversed: "Mâu thuẫn gia đình hoặc cảm giác không trọn vẹn trong niềm vui.", image: "/tarot/four_of_wands.png" },
    { id: "wands_05", name: "Five of Wands", keywords: "Cạnh tranh, Xung đột", meaning_upright: "Có sự cạnh tranh hoặc bất đồng quan điểm. Sự cọ xát này sẽ giúp bạn mạnh mẽ hơn.", meaning_reversed: "Tránh né mâu thuẫn hoặc cãi vã vô ích gây mệt mỏi.", image: "/tarot/five_of_wands.png" },
    { id: "wands_06", name: "Six of Wands", keywords: "Chiến thắng, Công nhận", meaning_upright: "Thành công của bạn được mọi người công nhận. Hãy tự hào về bản thân.", meaning_reversed: "Kiêu ngạo hoặc cảm thấy thành công của mình không được ai để ý.", image: "/tarot/six_of_wands.png" },
    { id: "wands_07", name: "Seven of Wands", keywords: "Kiên định, Phòng thủ", meaning_upright: "Hãy đứng vững bảo vệ quan điểm của mình dù có nhiều áp lực xung quanh.", meaning_reversed: "Cảm thấy bị áp đảo và muốn bỏ cuộc vì quá mệt mỏi.", image: "/tarot/seven_of_wands.png" },
    { id: "wands_08", name: "Eight of Wands", keywords: "Tốc độ, Tin tức", meaning_upright: "Mọi thứ đang diễn ra rất nhanh. Tin tức mới đang đến. Hãy hành động ngay.", meaning_reversed: "Sự chậm trễ, tắc nghẽn hoặc vội vàng hấp tấp dẫn đến sai sót.", image: "/tarot/eight_of_wands.png" },
    { id: "wands_09", name: "Nine of Wands", keywords: "Kiên cường, Đề phòng", meaning_upright: "Dù mệt mỏi và nhiều vết thương, bạn vẫn đứng vững. Chỉ còn một chút nữa là đến đích.", meaning_reversed: "Kiệt sức hoàn toàn. Bạn đang dựng lên bức tường phòng thủ không cần thiết.", image: "/tarot/nine_of_wands.png" },
    { id: "wands_10", name: "Ten of Wands", keywords: "Gánh nặng, Trách nhiệm", meaning_upright: "Bạn đang ôm đồm quá nhiều việc. Hãy học cách buông bỏ bớt hoặc chia sẻ gánh nặng.", meaning_reversed: "Sụp đổ vì áp lực. Bạn không thể gánh vác mọi thứ một mình mãi được.", image: "/tarot/ten_of_wands.png" },
    { id: "wands_page", name: "Page of Wands", keywords: "Khám phá, Nhiệt huyết", meaning_upright: "Một tin tức thú vị hoặc một sở thích mới khiến bạn tò mò muốn khám phá.", meaning_reversed: "Cả thèm chóng chán, thiếu định hướng rõ ràng.", image: "/tarot/page_of_wands.png" },
    { id: "wands_knight", name: "Knight of Wands", keywords: "Hành động, Phiêu lưu", meaning_upright: "Tràn đầy năng lượng để lao vào hành động. Bạn muốn giải quyết mọi thứ ngay lập tức.", meaning_reversed: "Nóng vội, hấp tấp và thiếu suy nghĩ chín chắn.", image: "/tarot/knight_of_wands.png" },
    { id: "wands_queen", name: "Queen of Wands", keywords: "Đam mê, Tự tin", meaning_upright: "Sự tự tin và quyến rũ của bạn đang tỏa sáng. Bạn biết mình muốn gì.", meaning_reversed: "Ghen tuông, hay so sánh hoặc cảm xúc thất thường.", image: "/tarot/queen_of_wands.png" },
    { id: "wands_king", name: "King of Wands", keywords: "Lãnh đạo, Tầm nhìn", meaning_upright: "Bạn đang làm chủ cuộc đời mình với tầm nhìn xa và khả năng truyền cảm hứng.", meaning_reversed: "Độc đoán, áp đặt ý muốn của mình lên người khác.", image: "/tarot/king_of_wands.png" },

    // CUPS (14)
    { id: "cups_01", name: "Ace of Cups", keywords: "Tình yêu, Cảm xúc mới", meaning_upright: "Trái tim bạn đang mở cửa đón nhận những cảm xúc mới. Tình yêu và niềm vui đang đến.", meaning_reversed: "Cảm xúc bị kìm nén hoặc cảm thấy trống rỗng bên trong.", image: "/tarot/ace_of_cups.png" },
    { id: "cups_02", name: "Two of Cups", keywords: "Kết nối, Đối tác", meaning_upright: "Sự kết nối sâu sắc giữa hai tâm hồn. Một mối quan hệ đang nảy nở.", meaning_reversed: "Mất kết nối, hiểu lầm hoặc mâu thuẫn trong mối quan hệ.", image: "/tarot/two_of_cups.png" },
    { id: "cups_03", name: "Three of Cups", keywords: "Vui vẻ, Bạn bè", meaning_upright: "Thời gian để tụ tập, vui chơi và chia sẻ niềm vui với bạn bè.", meaning_reversed: "Cảm thấy lạc lõng giữa đám đông hoặc ham vui quá đà.", image: "/tarot/three_of_cups.png" },
    { id: "cups_04", name: "Four of Cups", keywords: "Thờ ơ, Chán nản", meaning_upright: "Bạn cảm thấy chán nản với những gì đang có và phớt lờ những cơ hội mới đang đến.", meaning_reversed: "Bắt đầu tìm lại được hứng thú và động lực sống.", image: "/tarot/four_of_cups.png" },
    { id: "cups_05", name: "Five of Cups", keywords: "Tiếc nuối, Mất mát", meaning_upright: "Đừng mãi nhìn vào những gì đã mất mà quên đi những gì vẫn còn.", meaning_reversed: "Chấp nhận nỗi đau, tha thứ và sẵn sàng bước tiếp.", image: "/tarot/five_of_cups.png" },
    { id: "cups_06", name: "Six of Cups", keywords: "Hoài niệm, Quá khứ", meaning_upright: "Những ký ức đẹp đẽ của quá khứ ùa về. Sự ngây thơ và niềm vui đơn giản.", meaning_reversed: "Sống mãi trong quá khứ mà quên mất hiện tại.", image: "/tarot/six_of_cups.png" },
    { id: "cups_07", name: "Seven of Cups", keywords: "Ảo mộng, Lựa chọn", meaning_upright: "Có quá nhiều lựa chọn khiến bạn bối rối. Cẩn thận với những ảo vọng.", meaning_reversed: "Nhìn rõ thực tế và đưa ra được lựa chọn đúng đắn.", image: "/tarot/seven_of_cups.png" },
    { id: "cups_09", name: "Nine of Cups", keywords: "Hài lòng, Ước nguyện", meaning_upright: "Cảm giác thỏa mãn tuyệt đối. Điều bạn mong ước đang trở thành hiện thực.", meaning_reversed: "Tự mãn thái quá hoặc tham lam những thứ phù phiếm.", image: "/tarot/nine_of_cups.png" },
    { id: "cups_10", name: "Ten of Cups", keywords: "Hạnh phúc, Gia đình", meaning_upright: "Hạnh phúc viên mãn bên những người thân yêu. Sự bình yên trong tâm hồn.", meaning_reversed: "Mâu thuẫn gia đình hoặc cảm giác hạnh phúc giả tạo.", image: "/tarot/ten_of_cups.png" },
    { id: "cups_page", name: "Page of Cups", keywords: "Sáng tạo, Tin vui", meaning_upright: "Một thông điệp tình cảm hoặc một ý tưởng sáng tạo đầy bất ngờ đang đến.", meaning_reversed: "Cảm xúc non nớt, dễ bị tổn thương.", image: "/tarot/page_of_cups.png" },
    { id: "cups_knight", name: "Knight of Cups", keywords: "Lãng mạn, Lý tưởng", meaning_upright: "Một người lãng mạn, biết lắng nghe trái tim và theo đuổi cái đẹp.", meaning_reversed: "Sống quá cảm xúc, thiếu thực tế.", image: "/tarot/knight_of_cups.png" },
    { id: "cups_queen", name: "Queen of Cups", keywords: "Thấu cảm, Dịu dàng", meaning_upright: "Sự nhạy cảm và trực giác của bạn là món quà. Hãy lắng nghe người khác.", meaning_reversed: "Quá nhạy cảm, dễ bị ảnh hưởng bởi cảm xúc tiêu cực.", image: "/tarot/queen_of_cups.png" },
    { id: "cups_king", name: "King of Cups", keywords: "Cân bằng, Bao dung", meaning_upright: "Khả năng kiểm soát cảm xúc tuyệt vời. Bạn là chỗ dựa tinh thần vững chắc.", meaning_reversed: "Kìm nén cảm xúc quá mức.", image: "/tarot/king_of_cups.png" },

    // SWORDS (14)
    { id: "swords_01", name: "Ace of Swords", keywords: "Sự thật, Rõ ràng", meaning_upright: "Một khoảnh khắc lóe sáng của trí tuệ. Sự thật được phơi bày rõ ràng.", meaning_reversed: "Suy nghĩ rối rắm, thiếu minh mẫn.", image: "/tarot/ace_of_swords.png" },
    { id: "swords_04", name: "Four of Swords", keywords: "Nghỉ ngơi, Tĩnh dưỡng", meaning_upright: "Đã đến lúc tạm dừng mọi thứ để nghỉ ngơi và hồi phục năng lượng.", meaning_reversed: "Bị ép buộc phải hoạt động khi chưa sẵn sàng.", image: "/tarot/four_of_swords.png" },
    { id: "swords_05", name: "Five of Swords", keywords: "Xung đột, Thắng thua", meaning_upright: "Chiến thắng nhưng mất đi tình cảm. Có đáng để tranh cãi không?", meaning_reversed: "Muốn chấm dứt mâu thuẫn để tìm bình yên.", image: "/tarot/five_of_swords.png" },
    { id: "swords_06", name: "Six of Swords", keywords: "Rời đi, Chữa lành", meaning_upright: "Rời bỏ vùng nước dữ để đến nơi bình yên hơn.", meaning_reversed: "Gặp khó khăn khi cố gắng thay đổi.", image: "/tarot/six_of_swords.png" },
    { id: "swords_07", name: "Seven of Swords", keywords: "Lén lút, Mẹo vặt", meaning_upright: "Có sự không trung thực hoặc ai đó đang che giấu điều gì.", meaning_reversed: "Sự thật bị phơi bày.", image: "/tarot/seven_of_swords.png" },
    { id: "swords_08", name: "Eight of Swords", keywords: "Bế tắc, Tự giới hạn", meaning_upright: "Bạn cảm thấy bị mắc kẹt, nhưng dây trói là do suy nghĩ của bạn tạo ra.", meaning_reversed: "Tìm thấy lối thoát.", image: "/tarot/eight_of_swords.png" },
    { id: "swords_09", name: "Nine of Swords", keywords: "Lo âu, Mất ngủ", meaning_upright: "Những lo lắng thái quá đang ám ảnh giấc ngủ của bạn.", meaning_reversed: "Nỗi lo âu giảm bớt và hy vọng quay lại.", image: "/tarot/nine_of_swords.png" },
    { id: "swords_10", name: "Ten of Swords", keywords: "Kết thúc, Đáy vực", meaning_upright: "Mọi chuyện đã tệ đến mức không thể tệ hơn. Từ đây bạn chỉ có thể đi lên.", meaning_reversed: "Sự hồi sinh từ đống tro tàn.", image: "/tarot/ten_of_swords.png" },
    { id: "swords_page", name: "Page of Swords", keywords: "Tò mò, Quan sát", meaning_upright: "Tư duy sắc bén, ham học hỏi và luôn tìm kiếm sự thật.", meaning_reversed: "Nói nhiều làm ít.", image: "/tarot/page_of_swords.png" },
    { id: "swords_knight", name: "Knight of Swords", keywords: "Sắc sảo, Thẳng thắn", meaning_upright: "Hành động nhanh chóng dựa trên logic.", meaning_reversed: "Lời nói thiếu suy nghĩ gây tổn thương.", image: "/tarot/knight_of_swords.png" },
    { id: "swords_queen", name: "Queen of Swords", keywords: "Độc lập, Lý trí", meaning_upright: "Sử dụng trí tuệ và sự khách quan để giải quyết vấn đề.", meaning_reversed: "Lạnh lùng, cay nghiệt.", image: "/tarot/queen_of_swords.png" },

    // PENTACLES (14)
    { id: "pentacles_01", name: "Ace of Pentacles", keywords: "Cơ hội, Thịnh vượng", meaning_upright: "Một cơ hội tài chính hoặc công việc mới đầy hứa hẹn.", meaning_reversed: "Lỡ mất cơ hội hoặc chi tiêu thiếu kiểm soát.", image: "/tarot/ace_of_pentacles.png" },
    { id: "pentacles_05", name: "Five of Pentacles", keywords: "Thiếu thốn, Khó khăn", meaning_upright: "Giai đoạn khó khăn về tài chính hoặc sức khỏe. Đừng ngại tìm kiếm sự giúp đỡ.", meaning_reversed: "Tình hình đang dần được cải thiện.", image: "/tarot/five_of_pentacles.png" },
    { id: "pentacles_06", name: "Six of Pentacles", keywords: "Cho và Nhận, Hào phóng", meaning_upright: "Sự sẻ chia mang lại niềm vui.", meaning_reversed: "Sự bất công trong tiền bạc.", image: "/tarot/six_of_pentacls.png" },
    { id: "pentacles_07", name: "Seven of Pentacles", keywords: "Đầu tư, Kiên nhẫn", meaning_upright: "Đã gieo hạt thì phải kiên nhẫn chờ cây lớn.", meaning_reversed: "Nôn nóng muốn có kết quả ngay.", image: "/tarot/seven_of_pentacles.png" },
    { id: "pentacles_08", name: "Eight of Pentacles", keywords: "Chăm chỉ, Rèn luyện", meaning_upright: "Tập trung mài giũa kỹ năng. Sự chăm chỉ sẽ đưa bạn đến đỉnh cao.", meaning_reversed: "Làm việc máy móc thiếu sáng tạo.", image: "/tarot/eight_of_pentacles.png" },
    { id: "pentacles_09", name: "Nine of Pentacles", keywords: "Tự chủ, Tận hưởng", meaning_upright: "Tận hưởng thành quả lao động. Sự độc lập tài chính.", meaning_reversed: "Phụ thuộc vào người khác.", image: "/tarot/nine_of_pentacles.png" },
    { id: "pentacles_10", name: "Ten of Pentacles", keywords: "Sung túc, Gia đình", meaning_upright: "Sự thịnh vượng bền vững. Nền tảng gia đình vững chắc.", meaning_reversed: "Mâu thuẫn tiền bạc trong gia đình.", image: "/tarot/ten_of_pentacles.png" },
    { id: "pentacles_page", name: "Page of Pentacles", keywords: "Học hỏi, Thực tế", meaning_upright: "Bắt đầu học một kỹ năng mới với thái độ nghiêm túc.", meaning_reversed: "Thiếu tập trung, lười biếng.", image: "/tarot/page_of_pentacles.png" },
    { id: "pentacles_knight", name: "Knight of Pentacles", keywords: "Cần cù, Trách nhiệm", meaning_upright: "Làm việc chậm nhưng chắc. Một người đáng tin cậy.", meaning_reversed: "Trì trệ, lười biếng.", image: "/tarot/knight_of_pentacles.png" },
    { id: "pentacles_queen", name: "Queen of Pentacles", keywords: "Chăm sóc, Hậu phương", meaning_upright: "Biết cách chăm sóc bản thân và người khác.", meaning_reversed: "Quá nuông chiều bản thân.", image: "/tarot/queen_of_pentacles.png" },
    { id: "pentacles_king", name: "King of Pentacles", keywords: "Thành đạt, Doanh nhân", meaning_upright: "Đỉnh cao của sự thành công vật chất.", meaning_reversed: "Tham lam, thực dụng.", image: "/tarot/king_of_pentacles.png" },
];

const getTodayKey = () => {
    const today = new Date();
    return `tarot_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export default function DailyTarot() {
    const [drawnCard, setDrawnCard] = useState(null);
    const [isReversed, setIsReversed] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [hasDrawnToday, setHasDrawnToday] = useState(false);

    useEffect(() => {
        const todayKey = getTodayKey();
        const savedReading = localStorage.getItem(todayKey);

        if (savedReading) {
            const { cardId, reversed } = JSON.parse(savedReading);
            const card = TAROT_CARDS.find(c => c.id === cardId);
            setDrawnCard(card);
            setIsReversed(reversed);
            setHasDrawnToday(true);
            setIsFlipped(true);
        }
    }, []);

    const handleCardSelect = (index) => {
        if (hasDrawnToday || selectedIndex !== null) return;

        setSelectedIndex(index);

        const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
        const reversed = Math.random() < 0.3;

        const todayKey = getTodayKey();
        localStorage.setItem(todayKey, JSON.stringify({
            cardId: randomCard.id,
            reversed,
            drawnAt: new Date().toISOString()
        }));

        setTimeout(() => {
            setDrawnCard(randomCard);
            setIsReversed(reversed);
            setIsFlipped(true);
            setHasDrawnToday(true);
        }, 600);
    };

    return (
        <div className={styles.tarotContainer}>
            <div className={styles.header}>
                <h2>🔮 Tarot Hàng Ngày</h2>
                <p>{hasDrawnToday ? 'Lá bài của bạn hôm nay' : 'Chọn một lá bài để xem thông điệp'}</p>
            </div>

            {!hasDrawnToday && selectedIndex === null ? (
                <div className={styles.cardsRow}>
                    {[0, 1, 2].map((index) => (
                        <div key={index} className={styles.cardWrapper} onClick={() => handleCardSelect(index)}>
                            <div className={styles.cardBack}>
                                <div className={styles.cardBackDesign}>
                                    <span className={styles.cardBackSymbol}>✦</span>
                                    <div className={styles.cardBackPattern} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.revealedCard}>
                    <div className={`${styles.flipCard} ${isFlipped ? styles.flipped : ''}`}>
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardBackDesign}>
                                    <span className={styles.cardBackSymbol}>✦</span>
                                    <div className={styles.cardBackPattern} />
                                </div>
                            </div>

                            <div className={`${styles.flipCardFront} ${isReversed ? styles.reversed : ''}`}>
                                {drawnCard && (
                                    <>
                                        <div className={styles.cardImageWrapper}>
                                            <Image
                                                src={drawnCard.image}
                                                alt={drawnCard.name}
                                                width={140}
                                                height={200}
                                                className={styles.cardImage}
                                            />
                                        </div>
                                        {isReversed && <span className={styles.reversedBadge}>Ngược</span>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {isFlipped && drawnCard && (
                        <div className={styles.cardMeaning}>
                            <h3 className={styles.cardName}>{drawnCard.name}</h3>
                            <div className={styles.keywords}>
                                {drawnCard.keywords.split(', ').map((kw, i) => (
                                    <span key={i} className={styles.keyword}>{kw}</span>
                                ))}
                            </div>

                            <h4>{isReversed ? '🔄 Ý nghĩa Ngược' : '✨ Ý nghĩa Xuôi'}</h4>
                            <p>{isReversed ? drawnCard.meaning_reversed : drawnCard.meaning_upright}</p>

                            <div className={styles.dailyAdvice}>
                                <span>💫</span>
                                <p>
                                    {isReversed
                                        ? 'Hãy suy nghĩ về những gì đang cản trở bạn hôm nay.'
                                        : 'Hãy để năng lượng tích cực dẫn lối bạn hôm nay!'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.footer}>
                <span>🌟 Mỗi ngày một lá bài • {TAROT_CARDS.length} lá</span>
            </div>
        </div>
    );
}

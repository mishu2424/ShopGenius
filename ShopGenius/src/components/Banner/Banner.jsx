import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import Slide from './Slide';
const Banner = () => {
  return (
    <div>
      <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
        <SwiperSlide>
            <Slide bannerImg={'https://i.ibb.co/ycZVJb3L/51-WB3be6f-BL-SX3000.jpg'}></Slide>
        </SwiperSlide>
        <SwiperSlide>
            <Slide bannerImg={'https://i.ibb.co/CKZRF4Wr/71-RFCs-Bmdj-L-SX3000.jpg'}></Slide>
        </SwiperSlide>
        <SwiperSlide>
            <Slide bannerImg={'https://i.ibb.co/fd7xxphP/beautiful-dark-skinned-woman-surrounded-by-clothes-rack.jpg'}></Slide>
        </SwiperSlide>
        <SwiperSlide>
            <Slide bannerImg={'https://i.ibb.co/7NT92xLD/premium-photo-1661769021743-7139c6fc4ab9.jpg'}></Slide>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Banner;

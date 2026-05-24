export default function AboutSection() {
  return (
    <section
      id='about'
      className='py-16 bg-gray-100 px-4 md:px-0 max-w-4xl mx-auto text-center'
    >
      <h2 className='text-3xl font-bold mb-6'>About FuelEase</h2>
      <p className='text-gray-700 text-lg mb-4'>
        FuelEase is a modern fuel booking system designed for CNG and petrol
        vehicles. Our mission is to save your time by allowing you to reserve
        fuel slots in advance and avoid long queues.
      </p>
      <p className='text-gray-700 text-lg'>
        Track your bookings in real-time, manage your slots easily, and get
        notifications for your next refill. FuelEase ensures smooth and
        hassle-free refueling experiences.
      </p>
    </section>
  );
}

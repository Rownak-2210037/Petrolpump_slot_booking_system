export default function ContactSection() {
  return (
    <section
      id='contact'
      className='py-16 bg-white px-4 md:px-0 max-w-4xl mx-auto text-center'
    >
      <h2 className='text-3xl font-bold mb-6'>Contact Us</h2>
      <p className='text-gray-700 text-lg mb-4'>
        Have questions or feedback? We’d love to hear from you.
      </p>
      <form className='flex flex-col gap-4 max-w-xl mx-auto'>
        <input
          type='text'
          placeholder='Your Name'
          className='p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
        />
        <input
          type='email'
          placeholder='Your Email'
          className='p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
        />
        <textarea
          placeholder='Message'
          rows={5}
          className='p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
        />
        <button className='bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition'>
          Send Message
        </button>
      </form>
    </section>
  );
}

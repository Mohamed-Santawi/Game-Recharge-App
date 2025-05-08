const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About Us</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-4">
          Game Recharge Store is your trusted partner for all gaming needs. We
          provide a seamless platform for purchasing game credits, gift cards,
          and digital content.
        </p>
        <p className="text-gray-600 mb-4">
          Our mission is to make gaming accessible and convenient for everyone,
          offering competitive prices and instant delivery.
        </p>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Values
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Customer Satisfaction</li>
            <li>Secure Transactions</li>
            <li>24/7 Support</li>
            <li>Instant Delivery</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;

import { useEffect } from 'react';

const TrustPilotButton = () => {
  useEffect(() => {
    // Load Trustpilot script only once
    if (
      !document.querySelector(
        'script[src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"]'
      )
    ) {
      const script = document.createElement('script');
      script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="mt-2">
      <a
        href="https://www.trustpilot.com/evaluate/rento-lb.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium shadow-md"
      >
        Leave a Trustpilot Review
      </a>
    </div>
  );
};

export default TrustPilotButton;

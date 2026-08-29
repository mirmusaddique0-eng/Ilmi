
import "./Pages.css";

function Privacy() {
  return (
    <section className="info-page privacy-page">

      {/* =========================================
          PRIVACY HEADER
      ========================================= */}

      <div className="info-page-header">

        <h1>Privacy Policy</h1>

        <p>
          Your privacy is important to us. This policy
          explains how Ilmi handles information when you
          use our platform.
        </p>

      </div>


      {/* =========================================
          PRIVACY CONTENT
      ========================================= */}

      <div className="privacy-content">

        <div className="privacy-section">

          <h2>Information We Collect</h2>

          <p>
            When you create and use an account on Ilmi,
            we may collect information such as your name,
            email address and account information.
          </p>

          <p>
            We may also store learning-related information,
            such as course progress, completed lessons and
            quiz or practice activity.
          </p>

        </div>


        <div className="privacy-section">

          <h2>How We Use Information</h2>

          <p>
            The information collected by Ilmi is used to
            provide and improve your learning experience.
          </p>

          <p>
            This may include maintaining your account,
            showing your learning progress and providing
            relevant features of the platform.
          </p>

        </div>


        <div className="privacy-section">

          <h2>Account Information</h2>

          <p>
            If you create an account, you are responsible
            for keeping your account information secure.
          </p>

        </div>


        <div className="privacy-section">

          <h2>Data Security</h2>

          <p>
            We take reasonable steps to protect information
            associated with your account and learning
            activity. However, no online service can
            guarantee complete security.
          </p>

        </div>


        <div className="privacy-section">

          <h2>Third-Party Services</h2>

          <p>
            Ilmi may use third-party services to provide
            certain platform features, such as authentication
            and data storage. These services may process
            information according to their own privacy
            policies.
          </p>

        </div>


        <div className="privacy-section">

          <h2>Changes to This Policy</h2>

          <p>
            We may update this Privacy Policy from time to
            time as Ilmi develops and new features are added.
            Any updated version will be reflected on this page.
          </p>

        </div>


        <div className="privacy-section">

          <h2>Contact Us</h2>

          <p>
            If you have questions about this Privacy Policy,
            you can contact us through the contact information
            provided on the Contact page.
          </p>

        </div>

      </div>

    </section>
  );
}

export default Privacy;


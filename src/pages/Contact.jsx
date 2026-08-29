import "./Pages.css";
function Contact() {
  return (
    <section className="info-page">

      <div className="info-page-header">
        <h1>Contact Us</h1>

        <p>
          Have a question, suggestion, or feedback?
          We'd love to hear from you.
        </p>
      </div>


      <div className="contact-container">

        {/* ==============================
            CONTACT INFORMATION
        ============================== */}

        <div className="contact-info">

          <h2>Get in Touch</h2>

          <p>
            If you have any questions or suggestions
            about Ilmi, feel free to contact us.
          </p>


          <div className="contact-detail">

            <strong>Email</strong>

            <p>
              mirmusaddique0@gmail.com
            </p>

          </div>


          <div className="contact-detail">

            <strong>Phone</strong>

            <p>
              7841894817
            </p>

          </div>


          <div className="contact-detail">

            <strong>Address</strong>

            <p>
              Dargaroad, Parbhani,
              431401, Maharashtra, India
            </p>

          </div>

        </div>


        {/* ==============================
            CONTACT FORM
        ============================== */}

        <div className="contact-form">

          <h2>Send Us a Message</h2>

          <form>

            <div className="form-group">

              <label htmlFor="name">
                Name
              </label>

              <input
                type="text"
                id="name"
                placeholder="Enter your name"
              />

            </div>


            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                type="email"
                id="email"
                placeholder="Enter your email"
              />

            </div>


            <div className="form-group">

              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                rows="6"
                placeholder="Write your message..."
              ></textarea>

            </div>


            <button
              type="submit"
            >
              Send Message
            </button>

          </form>

        </div>

      </div>

    </section>
  );
}

export default Contact;


import { useState } from "react";
import "./Pages.css";
import { supabase } from "../lib/supabaseClient";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert([
          {
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
          },
        ]);

      if (error) {
        throw error;
      }

      setSuccess(
        "Your message has been sent successfully. Thank you for contacting us!"
      );

      // Clear form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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

          {/* SUCCESS MESSAGE */}

          {success && (
            <div className="contact-success">
              {success}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="contact-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Name
              </label>

              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>


            {/* SUBJECT */}

            <div className="form-group">

              <label htmlFor="subject">
                Subject
              </label>

              <input
                type="text"
                id="subject"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

            </div>


            {/* MESSAGE */}

            <div className="form-group">

              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                rows="6"
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>

            </div>


            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

          </form>

        </div>

      </div>

    </section>
  );
}

export default Contact;
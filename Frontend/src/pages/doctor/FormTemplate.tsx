import React, { useState } from 'react';

function SimpleForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/doctors/recent-patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to fetch patients');

      const data = await response.json();
      console.log('Recent Patients Data:', data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      console.log('Form submitted:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Contact Form</h3>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required /><br />
      <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required /><br />
      <textarea name="message" placeholder="Message" value={formData.message} onChange={handleChange} required /><br />
      <button type="submit">Send</button>
    </form>
  );
}

export default SimpleForm;

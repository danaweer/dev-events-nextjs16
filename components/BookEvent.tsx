'use client'

import { createBooking } from '@/lib/actions/bookings.action';
import posthog from 'posthog-js';
import React from 'react'
import { useState } from 'react';

const BookEvent = ( {eventId, slug }: { eventId: string; slug: string }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();

        const { success } = await createBooking({ eventId, slug, email }); //call server action to create booking

        if(success) {
            setSubmitted(true);
            posthog.capture('event_booked', { eventId, slug, email }); //track booking event with PostHog
        }else{
            console.error('Booking Creation failed');
            posthog.captureException('Booking Creation failed');//track booking failure with PostHog
        }
    } //handle form submission

  return (
    <div id="book-event">
        {submitted ? (
            <p className='text-sm'>Thank you for signing up!</p>
        ) : (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        id='email'
                        placeholder='Enter your email address'
                    />
                </div> {/* label group  */}

                <button type='submit' className='button-submit'>Submit</button>
            </form>
        )}
    </div>
  )
}

export default BookEvent

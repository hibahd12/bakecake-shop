<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * EmailVerificationCode Mailable
 * Sends a 6-digit OTP to a newly registered user.
 */
class EmailVerificationCode extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param string $code      6-digit verification code
     * @param string $userName  Recipient's display name
     */
    public function __construct(
        public readonly string $code,
        public readonly string $userName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Code de vérification – BakeCake 🎂',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.verification',
            with: [
                'code'     => $this->code,
                'userName' => $this->userName,
            ],
        );
    }
}

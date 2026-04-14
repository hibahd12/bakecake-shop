<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    // Store contact message (Public)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Message successfully sent!',
            'data' => $contact
        ], 201);
    }

    // Get all contact messages (Admin)
    public function index()
    {
        $messages = Contact::latest()->get();
        return response()->json(['data' => $messages]);
    }

    // Mark as read (Admin)
    public function markAsRead($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->update(['is_read' => true]);
        
        return response()->json(['message' => 'Marked as read']);
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Consultation;
use App\Models\Patient;

class ConsultationController extends Controller
{
    // View all consultations
    // In Doctor/ConsultationController.php
    public function index(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id'
        ]);

        $consultations = Consultation::with('patient')
            ->where('patient_id', $request->patient_id)
            ->latest()
            ->get();

        return response()->json(['consultations' => $consultations]);
    }

    // Create a new consultation
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'notes' => 'required|string',
        ]);

        $consultation = Consultation::create([
            'patient_id' => $request->patient_id,
            'notes' => $request->notes,
            'created_date' => now()->toDateString()
        ]);

        return response()->json(['message' => 'Consultation created', 'consultation' => $consultation], 201);
    }

    // Update a consultation
    public function update(Request $request, $id)
    {
        $consultation = Consultation::find($id);

        if (! $consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }

        $request->validate([
            'notes' => 'required|string'
        ]);

        $consultation->update(['notes' => $request->notes]);

        return response()->json(['message' => 'Consultation updated', 'consultation' => $consultation]);
    }

    // Delete a consultation
    public function destroy($id)
    {
        $consultation = Consultation::find($id);

        if (! $consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }

        $consultation->delete();

        return response()->json(['message' => 'Consultation deleted']);
    }
}

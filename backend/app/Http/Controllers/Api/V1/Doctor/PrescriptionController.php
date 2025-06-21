<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Prescription;

class PrescriptionController extends Controller
{
    // View all prescriptions
    // In Doctor/PrescriptionController.php
    public function index(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id'
        ]);

        $prescriptions = Prescription::with('patient')
            ->where('patient_id', $request->patient_id)
            ->latest()
            ->get();

        return response()->json(['prescriptions' => $prescriptions]);
    }

    // Create a prescription
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'content' => 'required|string',
        ]);

        $prescription = Prescription::create([
            'patient_id' => $request->patient_id,
            'content' => $request->content,
            'created_date' => now()->toDateString()
        ]);

        return response()->json(['message' => 'Prescription created', 'prescription' => $prescription], 201);
    }

    // Update a prescription
    public function update(Request $request, $id)
    {
        $prescription = Prescription::find($id);

        if (! $prescription) {
            return response()->json(['error' => 'Prescription not found'], 404);
        }

        $request->validate([
            'content' => 'required|string'
        ]);

        $prescription->update(['content' => $request->content]);

        return response()->json(['message' => 'Prescription updated', 'prescription' => $prescription]);
    }

    // Delete a prescription
    public function destroy($id)
    {
        $prescription = Prescription::find($id);

        if (! $prescription) {
            return response()->json(['error' => 'Prescription not found'], 404);
        }

        $prescription->delete();

        return response()->json(['message' => 'Prescription deleted']);
    }
}

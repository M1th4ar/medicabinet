<?php

namespace App\Http\Controllers\Api\V1\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    // View patient’s own appointments
    public function index()
    {
        $patient = Auth::user();
        $appointments = Appointment::where('patient_id', $patient->id)->get();

        return response()->json(['appointments' => $appointments]);
    }

    // Schedule new appointment
    public function store(Request $request)
    {
        $request->validate([
            'time' => 'required|date|after:now',
            'status' => 'in:scheduled,completed,cancelled',
        ]);

        // Check if the patient already has a scheduled appointment
        $hasScheduled = Appointment::where('patient_id', Auth::id())
            ->where('status', 'scheduled')
            ->exists();

        if ($hasScheduled) {
            return response()->json(['message' => 'You already have a scheduled appointment.'], 409);
        }

        $appointment = Appointment::create([
            'patient_id' => Auth::id(),
            'time' => $request->time,
            'status' => $request->status ?? 'scheduled',
            'created_date' => now()->toDateString(),
        ]);

        return response()->json(['message' => 'Appointment scheduled', 'appointment' => $appointment], 201);
    }


    // Reschedule
    public function update(Request $request, $id)
    {
        $appointment = Appointment::where('appointment_id', $id)->where('patient_id', Auth::id())->first();

        if (! $appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Prevent modifications if appointment is completed
        if ($appointment->status === 'completed') {
            return response()->json([
                'message' => 'Completed appointments cannot be modified'
            ], 403);
        }

        $request->validate([
            'time' => [
                'required',
                'date',
                'after:now', // No past dates
                'before_or_equal:' . now()->addMonths(2)->toDateString() // Max 2 months
            ]
        ]);

        $appointment->update([
            'time' => $request->time
        ]);

        return response()->json(['message' => 'Appointment rescheduled', 'appointment' => $appointment]);
    }

    // Cancel
    public function destroy($id)
    {
        $appointment = Appointment::where('appointment_id', $id)->where('patient_id', Auth::id())->first();

        if (! $appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Prevent cancellation if appointment is completed
        if ($appointment->status === 'completed') {
            return response()->json([
                'message' => 'Completed appointments cannot be cancelled'
            ], 403);
        }

        $appointment->delete();

        return response()->json(['message' => 'Appointment cancelled']);
    }
}

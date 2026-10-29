# Guest input backlog fix

Reported symptom: Mac host smooth, PC guest sees delayed inputs and position snapping. No session telemetry was available, so the exact network path is not confirmed.

Movement and retryable protocol-2 actions now use the existing authenticated unordered, zero-retransmit state channel. Reliable commands, authentication and control acknowledgments retain the ordered channel. Congested state sends are dropped at 8 KiB pending rather than accumulating up to 256 KiB. Movement sequence numbers reject old directions; contiguous action acknowledgments and repeated pending actions preserve one-shot operations across packet loss.

The D1 fallback coalesces movement by seat and match, retaining the highest sequence and pending action IDs while preserving ordinary commands. Repeated identical authoritative snapshots no longer rewind presentation prediction. Full HTTP relay still incurs polling latency; this does not provide a new realtime relay service or prove the reported PC issue is resolved.

Validation: 36 transport/prediction/authentication/pause/recovery tests pass, including four added backlog/congestion/reordering/duplicate-snapshot tests. TypeScript passes. No rendering or gameplay tuning changed. The unchanged engine's cached 240-match difficulty gate passes during packaging. Physical Mac-to-PC WAN retest remains required. Both clients should reload and create a fresh room to use the new transport behavior together.

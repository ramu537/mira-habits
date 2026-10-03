import AiCaptureDialog from "./AiCaptureDialog";

export default function AiHabitCaptureModal(props) {
  return <AiCaptureDialog {...props} targetDomain={"HABIT"}
    title="Build a habit"
    description="Describe the routine, frequency and cue in your own words."
    placeholder="Read for 20 minutes after breakfast every day. Start small with 5 minutes on busy days."
    label="What routine would you like to build?"
    images={false} />;
}

import { Shield } from "lucide-react";

interface AIDisclaimerProps {
  compact?: boolean;
}

export function AIDisclaimer({ compact = false }: AIDisclaimerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <Shield className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
        <span>AI scores are recommendations only. Final hiring decisions should always be made by a human recruiter.</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
      <div className="bg-blue-100 p-1.5 rounded-lg flex-shrink-0">
        <Shield className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-blue-900">Responsible AI Notice</p>
        <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
          AI-generated scores and recommendations are designed to assist, not replace, human judgment.
          All candidate assessments should be reviewed by a recruiter before making hiring decisions.
          Scores reflect pattern matching against stated requirements and may not capture all relevant factors.
        </p>
      </div>
    </div>
  );
}

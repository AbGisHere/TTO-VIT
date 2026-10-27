import { AppUser } from '../types/technologyBrief';

// Derived from the roles AuthContext already assigns; no role logic lives here.
// Ideas and industrial problem statements: @vitstudent.ac.in and @vit.ac.in accounts only.
export const canSubmitToTto = (user: AppUser | null): boolean =>
  !!user && (user.domain === 'vitstudent' || user.domain === 'vit' || user.role === 'master_admin');

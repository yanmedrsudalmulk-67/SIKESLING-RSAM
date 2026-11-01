import { NextRequest, NextResponse } from 'next/server';
import {
  getSystemArchitectureOverview,
  authorizeServerAction,
  validateDailyActivityInput,
  validateSupervisionInput,
} from '@/lib/services';
import { UserRole, PermissionAction } from '@/lib/domain';

export async function GET(req: NextRequest) {
  const roleParam = (req.nextUrl.searchParams.get('role') as UserRole) || 'Administrator';
  const overview = await getSystemArchitectureOverview(roleParam);
  return NextResponse.json(overview);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role: UserRole = body.role || 'Petugas Kesling';
    const action: PermissionAction = body.action || 'manage_operational';

    const auth = authorizeServerAction(role, action);
    if (!auth.authorized) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: 403 }
      );
    }

    if (body.type === 'validate_activity') {
      const validation = validateDailyActivityInput(body.payload || {});
      return NextResponse.json({
        ok: validation.valid,
        errors: validation.errors,
        mode: 'DRAFT_SESSION_VALIDATED',
      });
    }

    if (body.type === 'validate_supervision') {
      const validation = validateSupervisionInput(body.payload || {});
      return NextResponse.json({
        ok: validation.valid,
        errors: validation.errors,
        mode: 'DRAFT_SESSION_VALIDATED',
      });
    }

    return NextResponse.json({
      ok: true,
      message: auth.message,
      mode: 'DRAFT_SESSION_VALIDATED',
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Permintaan tidak valid.' },
      { status: 400 }
    );
  }
}

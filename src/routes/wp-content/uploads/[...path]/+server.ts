import { json } from '@sveltejs/kit';

export function GET({ params }) {
	return json(
		{
			error: 'Not Implemented',
			message: 'R2 image serving is not yet configured. This endpoint will serve legacy WordPress uploads from Cloudflare R2.',
			path: params.path
		},
		{ status: 501 }
	);
}
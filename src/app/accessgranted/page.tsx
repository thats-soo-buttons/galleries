		"use client";
		import React, { useState } from "react";

		export default function Page() {
			const [accessCodes, setAccessCodes] = useState<{ [key: string]: string }>({});
			const handleAccessCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
				e.preventDefault();
				const code = accessCodes['wearingOfTheGreen'] || "";
				if (!code) {
					setErrorWearingGreen("Please enter an access code.");
					return;
				}
				try {
					const response = await fetch("/api/validateCode", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ code })
					});
					const result = await response.json();
					if (result.success && result.folder_id) {
						setValidatedFolderId(result.folder_id);
						fetchWearingOfTheGreenImages(result.folder_id);
					} else {
						setErrorWearingGreen(result.message || "Invalid code or gallery not found.");
					}
				} catch (err) {
					setErrorWearingGreen("Server error. Please try again.");
				}
			};

			const [wearingGreenImages, setWearingGreenImages] = useState<any[]>([]);
			const [loadingWearingGreen, setLoadingWearingGreen] = useState(false);
			const [errorWearingGreen, setErrorWearingGreen] = useState('');
			const [validatedFolderId, setValidatedFolderId] = useState(null);

			const fetchWearingOfTheGreenImages = async (folderId) => {
				setLoadingWearingGreen(true);
				setErrorWearingGreen('');
				try {
					const response = await fetch('/api/listImages', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ folderId })
					});
					const data = await response.json();
					setWearingGreenImages(data.images || []);
				} catch (err) {
					setErrorWearingGreen('Failed to load images.');
				} finally {
					setLoadingWearingGreen(false);
				}
			};

			return (
				<>
					<div className="w-full bg-green-100 text-green-900 py-2 px-4 text-center font-semibold mb-6 rounded shadow">
						Support the gallery: Donate or share! <a href="/donate" className="underline text-green-700">Ways to support</a>
					</div>
					<div className="flex flex-col items-center">
						<h2 className="text-2xl font-bold mb-4 text-green-700">Wearing of the Green 2026</h2>
						<form onSubmit={handleAccessCodeSubmit} className="mb-4 flex flex-col items-center">
							<label className="mb-2 text-green-700 font-semibold">
								Access Code
								<input
									id="accessCodeInput"
									name="accessCode"
									type="text"
									value={accessCodes['wearingOfTheGreen'] || ""}
									onChange={e => setAccessCodes({ ...accessCodes, wearingOfTheGreen: e.target.value })}
									className="border rounded px-3 py-2 mb-2"
									autoComplete="off"
									required
									minLength={2}
									maxLength={20}
									size={10}
								/>
							</label>
							<button
								type="submit"
								className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition"
								disabled={!accessCodes['wearingOfTheGreen']}
							>
								Submit Code
							</button>
						</form>
						<button
							className="mb-4 bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition"
							onClick={() => validatedFolderId && fetchWearingOfTheGreenImages(validatedFolderId)}
							disabled={!validatedFolderId}
						>
							Load Gallery Images
						</button>
						{loadingWearingGreen && <div className="text-green-700 mb-4">Loading images...</div>}
						{errorWearingGreen && <div className="text-red-600 mb-4">{errorWearingGreen}</div>}
						{wearingGreenImages.length > 0 && (
							<div className="flex flex-wrap gap-4 justify-center">
								{wearingGreenImages.map((img, idx) => (
									<div key={idx} className="relative group flex flex-col items-center">
										<img src={img.url} alt={img.name} className="w-32 h-32 object-cover rounded border" />
										<div className="text-xs mt-1 text-black dark:text-zinc-50">{img.name}</div>
										<a
											href={`${img.url}&export=download`}
											download
											className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 text-white rounded-full p-1 transition"
											aria-label={`Download ${img.name}`}
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
											</svg>
										</a>
									</div>
								))}
							</div>
						)}
					</div>
				</>
			);
		}
		// Access code logic for all galleries
		const handleAccessCodeSubmit = async (e) => {
			e.preventDefault();
			const code = accessCodes['wearingOfTheGreen'] || "";
			if (!code) {
				setErrorWearingGreen("Please enter an access code.");
				return;
			}
			try {
				const response = await fetch("/api/validateCode", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ code })
				});
				const result = await response.json();
				if (result.success && result.folder_id) {
					setValidatedFolderId(result.folder_id);
					fetchWearingOfTheGreenImages(result.folder_id);
				} else {
					setErrorWearingGreen(result.message || "Invalid code or gallery not found.");
				}
			} catch (err) {
				setErrorWearingGreen("Server error. Please try again.");
			}
		};
	// State for Wearing of the Green gallery images
	const [wearingGreenImages, setWearingGreenImages] = useState<any[]>([]);
	const [loadingWearingGreen, setLoadingWearingGreen] = useState(false);
	const [errorWearingGreen, setErrorWearingGreen] = useState('');

	// Fetch images from Google Drive API for Wearing of the Green
	const [validatedFolderId, setValidatedFolderId] = useState(null);
	const fetchWearingOfTheGreenImages = async (folderId) => {
		setLoadingWearingGreen(true);
		setErrorWearingGreen('');
		try {
			const response = await fetch('/api/listImages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ folderId })
			});
			const data = await response.json();
			setWearingGreenImages(data.images || []);
		} catch (err) {
			setErrorWearingGreen('Failed to load images.');
		} finally {
			setLoadingWearingGreen(false);
		}
	};
			{/* Donation/support bar (example, place in layout for global visibility) */}
			<div className="w-full bg-green-100 text-green-900 py-2 px-4 text-center font-semibold mb-6 rounded shadow">
				Support the gallery: Donate or share! <a href="/donate" className="underline text-green-700">Ways to support</a>
			</div>

			{/* Wearing of the Green Gallery UI */}
			<div className="flex flex-col items-center">
				<h2 className="text-2xl font-bold mb-4 text-green-700">Wearing of the Green 2026</h2>
				<form onSubmit={handleAccessCodeSubmit} className="mb-4 flex flex-col items-center">
					<label className="mb-2 text-green-700 font-semibold">
						Access Code
						<input
							id="accessCodeInput"
							name="accessCode"
							type="text"
							value={accessCodes['wearingOfTheGreen'] || ""}
							onChange={e => setAccessCodes({ ...accessCodes, wearingOfTheGreen: e.target.value })}
							className="border rounded px-3 py-2 mb-2"
							autoComplete="off"
							required
							minLength={2}
							maxLength={20}
							size={10}
						/>
					</label>
					<button
						type="submit"
						className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition"
						disabled={!accessCodes['wearingOfTheGreen']}
					>
						Submit Code
					</button>
				</form>
				<button
					className="mb-4 bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition"
					onClick={() => validatedFolderId && fetchWearingOfTheGreenImages(validatedFolderId)}
					disabled={!validatedFolderId}
				>
					Load Gallery Images
				</button>
				{loadingWearingGreen && <div className="text-green-700 mb-4">Loading images...</div>}
				{errorWearingGreen && <div className="text-red-600 mb-4">{errorWearingGreen}</div>}
				{wearingGreenImages.length > 0 && (
					<div className="flex flex-wrap gap-4 justify-center">
						{wearingGreenImages.map((img, idx) => (
							<div key={idx} className="relative group flex flex-col items-center">
								<img src={img.url} alt={img.name} className="w-32 h-32 object-cover rounded border" />
								<div className="text-xs mt-1 text-black dark:text-zinc-50">{img.name}</div>
								{/* Download button on hover */}
								<a
									href={`${img.url}&export=download`}
									download
									className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 text-white rounded-full p-1 transition"
									aria-label={`Download ${img.name}`}
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
									</svg>
								</a>
							</div>
						))}
					</div>
				)}
			</div>

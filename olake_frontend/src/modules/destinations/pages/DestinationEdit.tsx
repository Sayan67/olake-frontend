import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Input, Button, Radio, Select, Switch, message } from "antd"
import { useAppStore } from "../../../store"
import { ArrowLeft, CornersIn } from "@phosphor-icons/react"

const DestinationEdit: React.FC = () => {
	const { destinationId } = useParams<{ destinationId: string }>()
	const navigate = useNavigate()
	const isNewDestination = destinationId === "new"
	const [activeTab, setActiveTab] = useState("config")
	const [setupType, setSetupType] = useState("new")
	const [connector, setConnector] = useState("Amazon S3")
	const [authType, setAuthType] = useState("iam")
	const [iamInfo, setIamInfo] = useState("")
	const [connectionUrl, setConnectionUrl] = useState("")
	const [destinationName, setDestinationName] = useState("")
	const [docsMinimized, setDocsMinimized] = useState(false)
	const [showAllJobs, setShowAllJobs] = useState(false)

	const {
		destinations,
		jobs,
		fetchDestinations,
		fetchJobs,
		// addDestination,
		// updateDestination,
	} = useAppStore()

	useEffect(() => {
		if (!destinations.length) {
			fetchDestinations()
		}

		if (!jobs.length) {
			fetchJobs()
		}

		if (!isNewDestination && destinationId) {
			const destination = destinations.find(d => d.id === destinationId)
			if (destination) {
				setDestinationName(destination.name)
				setConnector(destination.type)
				// Set other fields based on destination data
			}
		}
	}, [
		destinationId,
		isNewDestination,
		destinations,
		fetchDestinations,
		jobs.length,
		fetchJobs,
	])

	// Mock associated jobs for the destination
	const associatedJobs = jobs.slice(0, 5).map(job => ({
		...job,
		state: Math.random() > 0.7 ? "Inactive" : "Active",
		lastRuntime: "3 hours ago",
		lastRuntimeStatus: "Success",
		source: "MongoDB Source",
		paused: false,
	}))

	// Additional jobs that will be shown when "View all" is clicked
	const additionalJobs = jobs.slice(5, 10).map(job => ({
		...job,
		state: Math.random() > 0.7 ? "Inactive" : "Active",
		lastRuntime: "3 hours ago",
		lastRuntimeStatus: "Success",
		source: "MongoDB Source",
		paused: false,
	}))

	const displayedJobs = showAllJobs
		? [...associatedJobs, ...additionalJobs]
		: associatedJobs

	// const handleSave = () => {
	// 	const destinationData = {
	// 		name:
	// 			destinationName ||
	// 			`${connector}_destination_${Math.floor(Math.random() * 1000)}`,
	// 		type: connector,
	// 		status: "active" as const,
	// 	}

	// 	if (isNewDestination) {
	// 		addDestination(destinationData)
	// 			.then(() => {
	// 				message.success("Destination created successfully")
	// 				navigate("/destinations")
	// 			})
	// 			.catch(error => {
	// 				message.error("Failed to create destination")
	// 				console.error(error)
	// 			})
	// 	} else if (destinationId) {
	// 		updateDestination(destinationId, destinationData)
	// 			.then(() => {
	// 				message.success("Destination updated successfully")
	// 				navigate("/destinations")
	// 			})
	// 			.catch(error => {
	// 				message.error("Failed to update destination")
	// 				console.error(error)
	// 			})
	// 	}
	// }

	const handleDelete = () => {
		message.success("Destination deleted successfully")
		navigate("/destinations")
	}

	const handleTestConnection = () => {
		message.success("Connection test successful")
	}

	const handleCreateJob = () => {
		message.info("Creating job from this destination")
		navigate("/jobs/new")
	}

	const handleViewAllJobs = () => {
		setShowAllJobs(true)
	}

	const handlePauseAllJobs = (checked: boolean) => {
		message.info(
			`${checked ? "Pausing" : "Resuming"} all jobs for this destination`,
		)
	}

	const handlePauseJob = (jobId: string, checked: boolean) => {
		message.info(`${checked ? "Pausing" : "Resuming"} job ${jobId}`)
	}

	const toggleDocsPanel = () => {
		setDocsMinimized(!docsMinimized)
	}

	return (
		<div className="flex h-screen flex-col">
			{/* Header */}
			<div className="p-6 pb-0">
				<Link
					to="/destinations"
					className="mb-4 flex items-center text-blue-600"
				>
					<ArrowLeft
						size={16}
						className="mr-1"
					/>{" "}
					Back to Destinations
				</Link>

				<div className="mb-4 flex items-center">
					<h1 className="text-2xl font-bold">
						{isNewDestination
							? "Create New Destination"
							: destinationName || "<Destination_name>"}
					</h1>
					{!isNewDestination && (
						<span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
							Active
						</span>
					)}
				</div>
			</div>

			{/* Main content */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left content */}
				<div
					className={`${
						docsMinimized ? "w-full" : "w-3/4"
					} overflow-auto p-6 pt-0 transition-all duration-300`}
				>
					<div className="mb-4">
						<div className="flex border-b border-gray-200">
							<button
								className={`px-4 py-3 text-sm font-medium ${
									activeTab === "config"
										? "border-b-2 border-blue-600 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => setActiveTab("config")}
							>
								Config
							</button>
							{!isNewDestination && (
								<button
									className={`px-4 py-3 text-sm font-medium ${
										activeTab === "jobs"
											? "border-b-2 border-blue-600 text-blue-600"
											: "text-gray-500 hover:text-gray-700"
									}`}
									onClick={() => setActiveTab("jobs")}
								>
									Associated jobs
								</button>
							)}
						</div>
					</div>

					{activeTab === "config" ? (
						<div className="rounded-lg border border-gray-200 bg-white p-6">
							<div className="mb-6">
								<h3 className="mb-4 text-lg font-medium">
									Capture information
								</h3>
								<div className="mb-4 flex">
									<Radio.Group
										value={setupType}
										onChange={e => setSetupType(e.target.value)}
										className="flex"
									>
										<Radio
											value="new"
											className="mr-8"
										>
											Set up a new destination
										</Radio>
										<Radio value="existing">Use an existing destination</Radio>
									</Radio.Group>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div>
										<label className="mb-2 block text-sm font-medium text-gray-700">
											Connector:
										</label>
										<div className="flex items-center">
											<div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
												<span>
													{connector === "Amazon S3"
														? "S"
														: connector.charAt(0)}
												</span>
											</div>
											<Select
												value={connector}
												onChange={setConnector}
												className="w-full"
												options={[
													{ value: "Amazon S3", label: "Amazon S3" },
													{ value: "Snowflake", label: "Snowflake" },
													{ value: "BigQuery", label: "BigQuery" },
													{ value: "Redshift", label: "Redshift" },
												]}
											/>
										</div>
									</div>

									<div>
										<label className="mb-2 block text-sm font-medium text-gray-700">
											Name of your destination:
										</label>
										<Input
											placeholder="Enter the name of your destination"
											value={destinationName}
											onChange={e => setDestinationName(e.target.value)}
										/>
									</div>
								</div>
							</div>

							<div className="mb-6">
								<h3 className="mb-4 text-lg font-medium">Endpoint config</h3>
								<div className="mb-4 flex">
									<Radio.Group
										value={authType}
										onChange={e => setAuthType(e.target.value)}
										className="flex"
									>
										<Radio
											value="iam"
											className="mr-8"
										>
											IAM
										</Radio>
										<Radio value="keys">Access keys</Radio>
									</Radio.Group>
								</div>

								<div className="mb-4">
									<label className="mb-2 block text-sm font-medium text-gray-700">
										IAM info:
									</label>
									<Input
										placeholder="Enter your IAM info"
										value={iamInfo}
										onChange={e => setIamInfo(e.target.value)}
									/>
								</div>

								<div className="mb-4">
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Connection URL:
									</label>
									<Input
										placeholder="Enter your connection URL"
										value={connectionUrl}
										onChange={e => setConnectionUrl(e.target.value)}
									/>
								</div>
							</div>
						</div>
					) : (
						<div className="rounded-lg border border-gray-200 bg-white p-6">
							<h3 className="mb-4 text-lg font-medium">Associated jobs</h3>

							<table className="min-w-full">
								<thead>
									<tr className="border-b border-gray-200">
										<th className="px-4 py-3 text-left font-medium text-gray-700">
											Name
										</th>
										<th className="px-4 py-3 text-left font-medium text-gray-700">
											State
										</th>
										<th className="px-4 py-3 text-left font-medium text-gray-700">
											Last runtime
										</th>
										<th className="px-4 py-3 text-left font-medium text-gray-700">
											Last runtime status
										</th>
										<th className="px-4 py-3 text-left font-medium text-gray-700">
											Source
										</th>
										<th className="px-4 py-3 text-left font-medium text-gray-700">
											Pause job
										</th>
									</tr>
								</thead>
								<tbody>
									{displayedJobs.map((job, index) => (
										<tr
											key={index}
											className="border-b border-gray-100"
										>
											<td className="px-4 py-3">{job.name}</td>
											<td className="px-4 py-3">
												<span
													className={`rounded px-2 py-1 text-xs ${
														job.state === "Inactive"
															? "bg-red-100 text-red-600"
															: "bg-blue-100 text-blue-600"
													}`}
												>
													{job.state}
												</span>
											</td>
											<td className="px-4 py-3">{job.lastRuntime}</td>
											<td className="px-4 py-3">
												<span className="flex items-center text-green-500">
													<span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
													{job.lastRuntimeStatus}
												</span>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center">
													<div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
														<span>S</span>
													</div>
													{job.source}
												</div>
											</td>
											<td className="px-4 py-3">
												<Switch
													checked={job.paused}
													onChange={checked => handlePauseJob(job.id, checked)}
													className={job.paused ? "bg-blue-600" : "bg-gray-200"}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>

							{!showAllJobs && additionalJobs.length > 0 && (
								<div className="mt-6 flex justify-center">
									<Button
										type="default"
										onClick={handleViewAllJobs}
									>
										View all associated jobs
									</Button>
								</div>
							)}

							<div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
								<span className="font-medium">Pause all associated jobs</span>
								<Switch
									onChange={handlePauseAllJobs}
									className="bg-gray-200"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Documentation panel with iframe */}
				{!docsMinimized && (
					<div className="h-[calc(100vh-120px)] w-1/4 overflow-hidden border-l border-gray-200 bg-white">
						<div className="flex items-center justify-between border-b border-gray-200 p-4">
							<div className="flex items-center">
								<div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
									<span>D</span>
								</div>
								<span className="font-medium">Documentation</span>
							</div>
							<button onClick={toggleDocsPanel}>
								<CornersIn size={16} />
							</button>
						</div>
						<iframe
							src="about:blank"
							className="h-full w-full"
							title="Documentation"
						/>
					</div>
				)}
			</div>

			{/* Footer with buttons */}
			<div className="flex justify-between border-t border-gray-200 bg-white p-4">
				<div>
					{!isNewDestination && (
						<Button
							danger
							onClick={handleDelete}
						>
							Delete
						</Button>
					)}
				</div>
				<div className="flex space-x-4">
					<Button onClick={handleTestConnection}>Test connection</Button>
					<Button
						type="primary"
						className="bg-blue-600"
						onClick={handleCreateJob}
					>
						Create job
					</Button>
				</div>
			</div>
		</div>
	)
}

export default DestinationEdit

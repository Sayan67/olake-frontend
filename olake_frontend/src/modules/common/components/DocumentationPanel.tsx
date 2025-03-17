import { useState, useRef, useEffect } from "react"
import { Button } from "antd"
import {
	ArrowLeft,
	DotsThreeVertical,
	CornersIn,
	CornersOut,
} from "@phosphor-icons/react"

interface DocumentationPanelProps {
	title: string
	icon?: string
	docUrl: string
	isMinimized?: boolean
	onToggle?: () => void
	showResizer?: boolean
	initialWidth?: number
}

const DocumentationPanel: React.FC<DocumentationPanelProps> = ({
	title,
	icon,
	docUrl,
	isMinimized = false,
	onToggle,
	showResizer = true,
	initialWidth = 30,
}) => {
	const [docPanelWidth, setDocPanelWidth] = useState(initialWidth)
	const [isDocPanelCollapsed, setIsDocPanelCollapsed] = useState(isMinimized)
	const resizerRef = useRef<HTMLDivElement>(null)
	const iframeRef = useRef<HTMLIFrameElement>(null)

	useEffect(() => {
		setIsDocPanelCollapsed(isMinimized)
	}, [isMinimized])

	useEffect(() => {
		if (iframeRef.current) {
			iframeRef.current.src = docUrl
		}
	}, [docUrl])

	const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation() // Prevent click event from firing

		const startX = e.clientX
		const startWidth = docPanelWidth

		const handleMouseMove = (e: MouseEvent) => {
			const containerWidth = window.innerWidth
			const newWidth = Math.max(
				15,
				Math.min(
					75,
					startWidth - ((e.clientX - startX) / containerWidth) * 100,
				),
			)
			setDocPanelWidth(newWidth)
		}

		const handleMouseUp = () => {
			document.removeEventListener("mousemove", handleMouseMove)
			document.removeEventListener("mouseup", handleMouseUp)
		}

		document.addEventListener("mousemove", handleMouseMove)
		document.addEventListener("mouseup", handleMouseUp)
	}

	const toggleDocPanel = () => {
		setIsDocPanelCollapsed(!isDocPanelCollapsed)
		if (onToggle) {
			onToggle()
		}
	}

	if (isDocPanelCollapsed && !showResizer) {
		return (
			<div className="fixed bottom-6 right-6">
				<Button
					type="primary"
					className="flex items-center bg-blue-600"
					onClick={toggleDocPanel}
					icon={
						<CornersOut
							size={16}
							className="mr-2"
						/>
					}
				>
					Show Documentation
				</Button>
			</div>
		)
	}

	return (
		<>
			{showResizer && (
				<div
					className="relative z-10"
					style={{
						position: "relative",
						width: isDocPanelCollapsed ? "16px" : "0",
					}}
				>
					<div
						ref={resizerRef}
						className="group absolute left-0 top-1/2 flex h-20 w-4 -translate-y-1/2 cursor-ew-resize items-center justify-center"
						onMouseDown={handleResizeStart}
						onClick={e => {
							e.stopPropagation()
							toggleDocPanel()
						}}
					>
						<DotsThreeVertical
							size={16}
							className="text-gray-500"
						/>
					</div>
				</div>
			)}

			{/* Documentation panel */}
			<div
				className="h-[calc(100vh-120px)] overflow-hidden border-l-4 border-gray-200 bg-white"
				style={{
					width: isDocPanelCollapsed
						? "30px"
						: showResizer
							? `${docPanelWidth}%`
							: "25%",
					transition:
						"width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
					opacity: isDocPanelCollapsed ? 0 : 1,
					visibility: isDocPanelCollapsed ? "hidden" : "visible",
				}}
			>
				<div className="flex h-16 items-center justify-between border-b border-gray-200 p-4">
					<div className="flex items-center">
						<div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
							<span className="font-bold">{icon || title.charAt(0)}</span>
						</div>
						<span className="text-lg font-bold">{title}</span>
					</div>
					<div
						className="cursor-pointer rounded p-1 hover:bg-gray-100"
						onClick={toggleDocPanel}
					>
						{showResizer ? (
							<ArrowLeft
								size={16}
								className="text-gray-500"
							/>
						) : (
							<CornersIn size={16} />
						)}
					</div>
				</div>

				<iframe
					ref={iframeRef}
					src={docUrl}
					className="h-[calc(100%-64px)] w-full border-none"
					title="Documentation"
					sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
				/>
			</div>
		</>
	)
}

export default DocumentationPanel

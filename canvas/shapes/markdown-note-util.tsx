import {
    type TLShape,
    ShapeUtil,
    Rectangle2d,
    HTMLContainer,
    type TLResizeInfo,
} from "tldraw"
import { MarkdownNoteShapeComponent } from "./markdown-note"

export const MARKDOWN_NOTE_TYPE = "markdown-note" as const

declare module "tldraw" {
    export interface TLGlobalShapePropsMap {
        [MARKDOWN_NOTE_TYPE]: {
            noteId: string
            title: string
            preview: string
            markdown: string
            html: string
            color: string
            w: number
            h: number
        }
    }
}

export type MarkdownNoteShape = TLShape<typeof MARKDOWN_NOTE_TYPE>

export class MarkdownNoteShapeUtil extends ShapeUtil<MarkdownNoteShape> {
    static override type = MARKDOWN_NOTE_TYPE

    getDefaultProps(): MarkdownNoteShape["props"] {
        return {
            noteId: "",
            title: "Untitled",
            preview: "",
            markdown: "",
            html: "",
            color: "#3b82f6",
            w: 280,
            h: 200,
        }
    }

    getGeometry(shape: MarkdownNoteShape) {
        return new Rectangle2d({
            width: shape.props.w,
            height: shape.props.h,
            isFilled: true,
        })
    }

    component(shape: MarkdownNoteShape) {
        return (
            <HTMLContainer
                style={{
                    width: shape.props.w,
                    height: shape.props.h,
                    pointerEvents: "all",
                }}
            >
                <MarkdownNoteShapeComponent shape={shape} />
            </HTMLContainer>
        )
    }

    getIndicatorPath(shape: MarkdownNoteShape) {
        const path = new Path2D()
        path.roundRect(0, 0, shape.props.w, shape.props.h, 8)
        return path
    }

    override onResize(
        shape: MarkdownNoteShape,
        info: TLResizeInfo<MarkdownNoteShape>,
    ) {
        return {
            ...shape,
            props: {
                ...shape.props,
                w: Math.max(120, info.initialBounds.width * info.scaleX),
                h: Math.max(80, info.initialBounds.height * info.scaleY),
            },
        }
    }
}

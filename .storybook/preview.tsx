import type { Preview } from "@storybook/react-vite"
import "@/index.css"

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { disable: true },
  },
}

export default preview

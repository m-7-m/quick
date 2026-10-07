import { IconSearch } from "@tabler/icons-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

type TableSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function TableSearch({ value, onChange }: TableSearchProps) {
  return (
    <InputGroup className="w-full max-w-sm">
      <InputGroupAddon>
        <IconSearch aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Search apps by name"
        onValueChange={onChange}
        placeholder="Search apps…"
        type="search"
        value={value}
      />
    </InputGroup>
  )
}

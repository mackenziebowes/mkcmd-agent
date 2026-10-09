import { BlueprintButton, BlueprintContainer, BlueprintNav } from "@/components/themed";

export default function NotFound() {
    return (
        <BlueprintContainer>
            <BlueprintNav brand="404" subtitle="SHEET NOT FOUND" metadata={[{ label: "STATUS", value: "MISSING" }]} />
            <p className="text-sm text-[#555]">There is no drawing at this address.</p>
            <BlueprintButton href="/" figLabel="ACT-00">Back to the index</BlueprintButton>
        </BlueprintContainer>
    );
}

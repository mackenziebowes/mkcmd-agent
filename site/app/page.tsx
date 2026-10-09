import type { Metadata } from "next";
import {
    BlueprintButton,
    BlueprintCard,
    BlueprintCardGrid,
    BlueprintContainer,
    BlueprintFooter,
    BlueprintNav,
    BlueprintTerminal,
} from "@/components/themed";
import { contentConfig } from "@/lib/contentConfig";
import { ogImage } from "@/lib/docs";

export const metadata: Metadata = {
    openGraph: ogImage("home", "Topographic map generated from the mkcmd-agent home page"),
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "mkcmd-agent",
    description:
        "Scaffolds Bun + TypeScript CLIs that agents can drive: flags instead of prompts, one JSON object on stdout, exit codes 0/1/2, and a describe command.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    license: "https://opensource.org/licenses/MIT",
    codeRepository: contentConfig.githubRepo,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "Mackenzie Bowes", url: "https://mackenziebowes.com" },
};

function SectionTitle({ title, refNo }: { title: string; refNo: string }) {
    return (
        <div className="flex items-center gap-5 my-15">
            <h2 className="text-xl uppercase font-normal border-b-2 border-(--ink-primary) pb-1 m-0">{title}</h2>
            <div className="flex-1 border-b border-(--ink-primary)" />
            <div className="text-xs">REF: {refNo}</div>
        </div>
    );
}

export default function Home() {
    return (
        <main className="min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <BlueprintContainer>
                <BlueprintNav
                    brand="mkcmd-agent"
                    subtitle="CLI ARCHITECTURE SUITE · AGENT EDITION"
                    metadata={[
                        { label: "SCALE", value: "GLBL" },
                        { label: "DWG NO.", value: "W-01" },
                        { label: "REV", value: contentConfig.version },
                    ]}
                />

                <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 mb-20">
                    <div className="flex flex-col justify-center min-w-0">
                        <div className="text-(--ink-secondary) text-xs mb-2.5 flex items-center gap-2.5">
                            <span className="flex-1 h-px bg-(--ink-secondary)" />
                            <span className="bg-(--paper) px-1">HEIGHT: FLUID</span>
                            <span className="flex-1 h-px bg-(--ink-secondary)" />
                        </div>

                        <h2 className="text-xl lg:text-2xl leading-relaxed mb-8 text-[#333]">
                            SCAFFOLD COMMAND LINE INTERFACES
                            <br />
                            THAT AGENTS CAN DRIVE.
                            <span className="block text-(--ink-secondary) text-base mt-2">
                                [FLAGS · JSON · EXIT CODES]
                            </span>
                        </h2>

                        <p className="mb-5 max-w-md text-sm text-[#555]">
                            Most CLIs ask questions and print decorated text. An agent can&apos;t answer a prompt or
                            parse a banner. mkcmd-agent generates Bun + TypeScript CLIs that take flags, print one JSON
                            object with <code>--json</code>, and exit 0, 1 or 2.
                        </p>

                        <BlueprintTerminal
                            className="overflow-x-auto"
                            commands={['mkcmd-agent init --name my-cli --description "Does one thing well"']}
                            output={["Created my-cli", "  10 files: src/core/cli.ts, AGENTS.md, test/cli.test.ts ...", "Next: cd my-cli && bun install"]}
                        />

                        <div>
                            <BlueprintButton href="/docs/usage/" figLabel="ACT-01">
                                Read the docs
                            </BlueprintButton>
                        </div>
                    </div>

                    <div
                        className="border border-(--ink-primary) min-h-[400px] relative items-center justify-center hidden lg:flex"
                        style={{
                            backgroundImage: "radial-gradient(var(--ink-secondary) 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }}
                        aria-hidden
                    >
                        <div className="absolute -translate-x-[50%] top-[50%] -left-2.5 text-xs text-(--ink-secondary) -rotate-90">
                            ELEVATION A
                        </div>
                        <div
                            className="w-[200px] h-[200px] border border-(--ink-primary) relative motion-reduce:animate-none"
                            style={{
                                transform: "rotateX(60deg) rotateZ(45deg)",
                                transformStyle: "preserve-3d",
                                animation: "rotateSchematic 10s infinite linear",
                            }}
                        >
                            {[
                                "translateZ(100px)",
                                "translateZ(-100px)",
                                "rotateX(-90deg) translateZ(100px)",
                                "rotateX(90deg) translateZ(100px)",
                                "rotateY(-90deg) translateZ(100px)",
                                "rotateY(90deg) translateZ(100px)",
                            ].map((t) => (
                                <div
                                    key={t}
                                    className="absolute w-[200px] h-[200px] border border-(--ink-primary) bg-[rgba(61,90,254,0.05)]"
                                    style={{ transform: t }}
                                />
                            ))}
                        </div>
                        <div className="absolute bottom-5 w-4/5 border-b border-(--ink-secondary) text-center text-xs text-(--ink-secondary)">
                            <span className="bg-(--paper) px-1">200mm</span>
                        </div>
                    </div>
                </section>

                <section>
                    <SectionTitle title="An agent's first three calls" refNo="B-02" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="min-w-0">
                            <div className="text-xs text-(--ink-secondary) mb-1">FIG. A · LEARN THE CLI</div>
                            <BlueprintTerminal
                                className="overflow-x-auto"
                                commands={["my-cli describe"]}
                                output={[
                                    '{"name":"my-cli","commands":[{"name":"hello","usage":"my-cli hello --name <name> [flags]",',
                                    '  "flags":[{"name":"--name","type":"string","required":true,...}],',
                                    '  "examples":["my-cli hello --name Ada --json"]}]}',
                                ]}
                            />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs text-(--ink-secondary) mb-1">FIG. B · FAIL, THEN SUCCEED</div>
                            <BlueprintTerminal
                                className="overflow-x-auto"
                                commands={["my-cli hello --json", "echo $?", "my-cli hello --name Ada --json"]}
                                output={[
                                    '{"ok":false,"command":"hello","error":{"code":"usage","message":"Missing required flag: --name.","hint":"Example: my-cli hello --name Ada --json"}}',
                                    "2",
                                    '{"ok":true,"command":"hello","result":{"greeting":"Hello, Ada!"}}',
                                ]}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <SectionTitle title="Component assembly" refNo="B-03" />
                    <BlueprintCardGrid>
                        <BlueprintCard
                            number="01"
                            title="Flags, not prompts"
                            description="Every input is a flag. A missing required flag fails fast with exit 2 and a working example. Nothing waits on stdin."
                        />
                        <BlueprintCard
                            number="02"
                            title="One JSON object"
                            description="--json prints {ok, command, result} or {ok: false, error: {code, message, hint}}. Logs go to stderr, so stdout always parses."
                        />
                        <BlueprintCard
                            number="03"
                            title="describe"
                            description="Every command, flag, default and example as JSON. An agent reads it once instead of guessing at --help text."
                        />
                    </BlueprintCardGrid>
                    <BlueprintCardGrid className="mt-8">
                        <BlueprintCard
                            number="04"
                            title="Typed commands"
                            description="defineCommand infers flag types from their specs. run returns data and throws CliError to fail. The framework does the rest."
                        />
                        <BlueprintCard
                            number="05"
                            title="add"
                            description="mkcmd-agent add writes a command file and registers it. Nobody hand-edits the command list."
                        />
                        <BlueprintCard
                            number="06"
                            title="Tests and AGENTS.md"
                            description="Generated projects ship subprocess tests of the contract and an AGENTS.md that tells the next agent how the CLI works."
                        />
                    </BlueprintCardGrid>
                </section>

                <section className="mt-15 flex flex-col md:flex-row gap-10 justify-between items-start">
                    <div className="w-full md:w-[45%]">
                        <div className="flex items-center gap-5 mb-8">
                            <h2 className="text-xl uppercase font-normal border-b-2 border-(--ink-primary) pb-1 m-0">
                                Specifications
                            </h2>
                        </div>
                        <ul className="list-none p-0 text-sm">
                            {[
                                { label: "RUNTIME", value: "BUN" },
                                { label: "LANGUAGE", value: "TYPESCRIPT" },
                                { label: "FRAMEWORK DEPENDENCIES", value: "NONE" },
                                { label: "OUTPUT", value: "TEXT OR --JSON" },
                                { label: "EXIT CODES", value: "0 / 1 / 2" },
                                { label: "LICENSE", value: "MIT" },
                            ].map((spec) => (
                                <li
                                    key={spec.label}
                                    className="border-b border-dashed border-(--ink-secondary) py-2.5 flex justify-between gap-4"
                                >
                                    <span>{spec.label}</span>
                                    <strong>{spec.value}</strong>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full md:w-[45%] text-sm text-[#555]">
                        <div className="flex items-center gap-5 mb-8">
                            <h2 className="text-xl uppercase font-normal border-b-2 border-(--ink-primary) pb-1 m-0 text-(--ink-primary)">
                                Lineage
                            </h2>
                        </div>
                        <p>
                            A fork of <a className="underline" href={contentConfig.originalRepo}>mkcmd</a>, which
                            scaffolds the same kind of CLI through interactive prompts; mkcmd-agent keeps the idea and
                            rebuilds the interface around flags, structured output and exit codes.
                        </p>
                        <p className="mt-4">
                            Agents can read the whole manual as plain text at{" "}
                            <a className="underline" href="/llms.txt">/llms.txt</a>.
                        </p>
                    </div>
                </section>
            </BlueprintContainer>

            <BlueprintFooter
                project="MKCMD-AGENT"
                sheet="W-01"
                revision={contentConfig.version}
                copyright={contentConfig.copyright}
            />
        </main>
    );
}

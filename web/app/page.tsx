import { CapsuleMenu } from "@/components/capsule-menu"
import { Journey } from "@/components/journey"
import { ServicesIndex } from "@/components/sections/services-index"
import { IslandMap } from "@/components/sections/island-map"
import { PackageBuilder } from "@/components/sections/package-builder"
import { PrivateTeaser } from "@/components/sections/private-teaser"
import { Standards } from "@/components/sections/standards"
import { Faq } from "@/components/sections/faq"
import { Contact } from "@/components/sections/contact"
import { SiteFooter } from "@/components/sections/site-footer"

export default function Home() {
  return (
    <>
      <a className="skip" href="#builder">Skip to planning your stay</a>
      <CapsuleMenu />
      <main id="top">
        <Journey />
        <div className="after-journey">
          <ServicesIndex />
          <IslandMap />
          <PackageBuilder />
          <PrivateTeaser />
          <Standards />
          <Faq />
          <Contact />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

import svgPaths from "./svg-pdwo1joi0c";
import imgEllipse231 from "figma:asset/199f7255b8b99d763083214d0bf3ef52d0340fd6.png";
import imgFrame2147203363 from "figma:asset/5c71d83e59dd58f851b8fe397137b1ad6b72ca29.png";
import imgFrame2147203364 from "figma:asset/0ce76278bf44bef2694bf2965d28168b5a197240.png";
import imgFrame2147203365 from "figma:asset/381e1db2a4365bd4abdfb93cae2bbe259df0b2c1.png";
import imgFrame2147203366 from "figma:asset/ce98855661adbf14ff8be9e1b1dca9f1490f7a6d.png";
import imgFrame2147203367 from "figma:asset/8ef1bf89b4ec2baeec3353b996e6e1af844c1b5a.png";
import imgFrame2147203368 from "figma:asset/f90ae6a1d6f863d4c1368039750043b1c42a9f35.png";

function Logo() {
  return (
    <div className="relative shrink-0 size-10" data-name="Logo">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 40 40"
      >
        <g id="Logo">
          <g id="Union">
            <path
              clipRule="evenodd"
              d={svgPaths.p2529bf00}
              fill="var(--fill-0, #262626)"
              fillRule="evenodd"
            />
            <path d={svgPaths.p4f1bee0} fill="var(--fill-0, #262626)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Tab() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-full items-center justify-center px-2 py-2.5 relative shrink-0"
      data-name="Tab"
    >
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic opacity-50 relative shrink-0 text-[14px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">Dashboard</p>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-full items-center justify-center px-2 py-2.5 relative shrink-0"
      data-name="Tab"
    >
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic opacity-50 relative shrink-0 text-[14px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">Explore</p>
      </div>
    </div>
  );
}

function Tab2() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-full items-center justify-center px-2 py-2.5 relative shrink-0"
      data-name="Tab"
    >
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">My Projects</p>
      </div>
    </div>
  );
}

function NavigationLinks() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-1 h-[70px] items-center justify-start p-0 relative shrink-0"
      data-name="Navigation Links"
    >
      <Tab />
      <Tab1 />
      <Tab2 />
    </div>
  );
}

function LogoAndNavigation() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative shrink-0"
      data-name="Logo and Navigation"
    >
      <Logo />
      <NavigationLinks />
    </div>
  );
}

function Button() {
  return (
    <div
      className="bg-neutral-800 box-border content-stretch flex flex-row gap-2.5 h-9 items-center justify-center px-4 py-2.5 relative rounded-[50px] shrink-0"
      data-name="Button"
    >
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[14px] text-nowrap text-right">
        <p className="block leading-[1.01] whitespace-pre">New Project</p>
      </div>
    </div>
  );
}

function Icons() {
  return (
    <div className="relative shrink-0 size-4" data-name="Icons">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
      >
        <g id="Icons">
          <g id="Frame"></g>
          <path
            d="M12 7L8 11L4 7"
            id="Vector 3589"
            stroke="var(--stroke-0, #676767)"
          />
        </g>
      </svg>
    </div>
  );
}

function UserProfileAndDropdown() {
  return (
    <div
      className="bg-[#ede8e4] box-border content-stretch flex flex-row gap-1 h-full items-center justify-start p-[4px] relative rounded-[50px] shrink-0 w-[60px]"
      data-name="User Profile and Dropdown"
    >
      <div className="relative shrink-0 size-7">
        <img
          className="block max-w-none size-full"
          height="28"
          src={imgEllipse231}
          width="28"
        />
      </div>
      <Icons />
    </div>
  );
}

function UserActions() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[9px] items-center justify-start p-0 relative shrink-0"
      data-name="User Actions"
    >
      <Button />
      <div className="flex flex-row items-center self-stretch">
        <UserProfileAndDropdown />
      </div>
    </div>
  );
}

function Frame2147203295() {
  return (
    <div
      className="absolute h-[11.667px] translate-x-[-50%] translate-y-[-50%] w-[11.437px]"
      style={{ top: "calc(50% - 0.245px)", left: "calc(50% - 0.114px)" }}
    >
      <div className="absolute bottom-[-4.28%] left-[-4.363%] right-[-4.382%] top-[-4.286%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 13 14"
        >
          <g id="Frame 2147203295">
            <path
              d={svgPaths.p2ad45d00}
              id="Vector"
              stroke="var(--stroke-0, #262626)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={svgPaths.pcd4d00}
              id="Vector_2"
              stroke="var(--stroke-0, #262626)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icons1() {
  return (
    <div
      className="opacity-50 overflow-clip relative shrink-0 size-5"
      data-name="Icons"
    >
      <Frame2147203295 />
    </div>
  );
}

function Frame2147203298() {
  return (
    <div className="absolute box-border content-stretch flex flex-row gap-1 items-center justify-start left-3 p-0 top-1/2 translate-y-[-50%]">
      <Icons1 />
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#676767] text-[14px] text-left text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">Search</p>
      </div>
    </div>
  );
}

function InputSearch() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[46px] left-1/2 rounded-[516.454px] top-3 translate-x-[-50%] w-[414px]"
      data-name="Input/Search"
    >
      <div className="absolute border border-[rgba(38,38,38,0.01)] border-solid inset-0 pointer-events-none rounded-[516.454px]" />
      <Frame2147203298 />
    </div>
  );
}

function Navigation() {
  return (
    <div
      className="bg-[#faf6f2] relative shrink-0 w-full"
      data-name="Navigation"
    >
      <div className="absolute border-[0px_0px_1px] border-[rgba(38,38,38,0.01)] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-between px-10 py-0 relative w-full">
          <LogoAndNavigation />
          <UserActions />
          <InputSearch />
        </div>
      </div>
    </div>
  );
}

function Frame2147203363() {
  return (
    <div
      className="aspect-[293/195] bg-center bg-cover bg-no-repeat shrink-0 w-full"
      style={{ backgroundImage: `url('${imgFrame2147203363}')` }}
    />
  );
}

function Tags() {
  return (
    <div
      className="bg-[#feec91] box-border content-stretch flex flex-row gap-[9.999px] h-7 items-center justify-center px-[9.999px] py-1 relative rounded-[99.992px] shrink-0"
      data-name="Tags"
    >
      <div className="absolute border-[#fedf47] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[99.992px]" />
      <div className="font-['Azeret_Mono:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[10px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.4] whitespace-pre">Biology</p>
      </div>
    </div>
  );
}

function Frame2147203321() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="font-['Gentium_Plus:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[24px] text-left text-neutral-800 w-full">
        <p className="block leading-[1.15]">
          Field research on the American Pika
        </p>
      </div>
    </div>
  );
}

function Frame2147203369() {
  return (
    <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 w-full">
      <Tags />
      <Frame2147203321 />
    </div>
  );
}

function Frame2() {
  return (
    <div
      className="absolute left-[-2px] size-4 top-1/2 translate-y-[-50%]"
      data-name="Frame"
    />
  );
}

function Frame2147203310() {
  return (
    <div className="absolute left-1/2 size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
      >
        <g id="Frame 2147203310">
          <path
            d={svgPaths.p30e8a700}
            fill="var(--fill-0, #676767)"
            id="Subtract"
          />
        </g>
      </svg>
    </div>
  );
}

function Icons2() {
  return (
    <div className="relative shrink-0 size-3" data-name="Icons">
      <Frame2 />
      <Frame2147203310 />
    </div>
  );
}

function Frame2147203309() {
  return (
    <div className="box-border content-stretch flex flex-row gap-0.5 items-center justify-start p-0 relative shrink-0 w-full">
      <Icons2 />
      <div className="basis-0 font-['Azeret_Mono:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#676767] text-[10px] text-left uppercase">
        <p className="block leading-[1.4]">Charleston, NC</p>
      </div>
    </div>
  );
}

function Frame2147203319() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="flex items-center justify-center relative shrink-0 w-full">
        <div className="flex-none rotate-[180deg] w-full">
          <div className="h-0 relative w-full">
            <div
              className="absolute bottom-[-0.306px] left-0 right-0 top-[-0.306px]"
              style={
                { "--stroke-0": "rgba(38, 38, 38, 1)" } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 310 2"
              >
                <path
                  d="M0 1H310"
                  id="Vector 71"
                  stroke="var(--stroke-0, #262626)"
                  strokeDasharray="0.33 1.97"
                  strokeWidth="0.611611"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Frame2147203309 />
    </div>
  );
}

function Frame2147203317() {
  return (
    <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
      <Frame2147203369 />
      <Frame2147203319 />
    </div>
  );
}

function BrowseCards() {
  return (
    <div
      className="[grid-area:1_/_1] bg-[#ffffff] relative rounded shrink-0"
      data-name="Browse Cards"
    >
      <div className="absolute border border-[rgba(38,38,38,0.01)] border-solid inset-0 pointer-events-none rounded" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative size-full">
          <Frame2147203363 />
          <Frame2147203317 />
        </div>
      </div>
    </div>
  );
}

function Frame2147203364() {
  return (
    <div
      className="aspect-[293/195] bg-center bg-cover bg-no-repeat shrink-0 w-full"
      style={{ backgroundImage: `url('${imgFrame2147203364}')` }}
    />
  );
}

function Tags1() {
  return (
    <div
      className="bg-[#cae3ff] box-border content-stretch flex flex-row gap-[9.999px] h-7 items-center justify-center px-[9.999px] py-1 relative rounded-[99.992px] shrink-0"
      data-name="Tags"
    >
      <div className="absolute border border-[#a6d1ff] border-solid inset-0 pointer-events-none rounded-[99.992px]" />
      <div className="font-['Azeret_Mono:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[10px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.4] whitespace-pre">Marine Sci.</p>
      </div>
    </div>
  );
}

function Frame2147203322() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="font-['Gentium_Plus:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[24px] text-left text-neutral-800 w-full">
        <p className="block leading-[1.15]">Chesapeake Water Watch</p>
      </div>
    </div>
  );
}

function Frame2147203370() {
  return (
    <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 w-full">
      <Tags1 />
      <Frame2147203322 />
    </div>
  );
}

function Frame3() {
  return (
    <div
      className="absolute left-[-2px] size-4 top-1/2 translate-y-[-50%]"
      data-name="Frame"
    />
  );
}

function Frame2147203311() {
  return (
    <div className="absolute left-1/2 size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
      >
        <g id="Frame 2147203310">
          <path
            d={svgPaths.p30e8a700}
            fill="var(--fill-0, #676767)"
            id="Subtract"
          />
        </g>
      </svg>
    </div>
  );
}

function Icons3() {
  return (
    <div className="relative shrink-0 size-3" data-name="Icons">
      <Frame3 />
      <Frame2147203311 />
    </div>
  );
}

function Frame2147203312() {
  return (
    <div className="box-border content-stretch flex flex-row gap-0.5 items-center justify-start p-0 relative shrink-0 w-full">
      <Icons3 />
      <div className="basis-0 font-['Azeret_Mono:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#676767] text-[10px] text-left uppercase">
        <p className="block leading-[1.4]">Chesapeake Bay</p>
      </div>
    </div>
  );
}

function Frame2147203320() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="flex items-center justify-center relative shrink-0 w-full">
        <div className="flex-none rotate-[180deg] w-full">
          <div className="h-0 relative w-full">
            <div
              className="absolute bottom-[-0.306px] left-0 right-0 top-[-0.306px]"
              style={
                { "--stroke-0": "rgba(38, 38, 38, 1)" } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 310 2"
              >
                <path
                  d="M0 1H310"
                  id="Vector 71"
                  stroke="var(--stroke-0, #262626)"
                  strokeDasharray="0.33 1.97"
                  strokeWidth="0.611611"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Frame2147203312 />
    </div>
  );
}

function Frame2147203318() {
  return (
    <div className="box-border content-stretch flex flex-col h-[142px] items-start justify-between p-0 relative shrink-0 w-full">
      <Frame2147203370 />
      <Frame2147203320 />
    </div>
  );
}

function BrowseCards1() {
  return (
    <div
      className="[grid-area:1_/_2] bg-[#ffffff] relative rounded shrink-0"
      data-name="Browse Cards"
    >
      <div className="absolute border border-[rgba(38,38,38,0.01)] border-solid inset-0 pointer-events-none rounded" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative size-full">
          <Frame2147203364 />
          <Frame2147203318 />
        </div>
      </div>
    </div>
  );
}

function Frame2147203365() {
  return (
    <div
      className="aspect-[293/195] bg-center bg-cover bg-no-repeat shrink-0 w-full"
      style={{ backgroundImage: `url('${imgFrame2147203365}')` }}
    />
  );
}

function Tags2() {
  return (
    <div
      className="bg-[#e0f4bf] box-border content-stretch flex flex-row gap-[9.999px] h-7 items-center justify-center px-[9.999px] py-1 relative rounded-[99.992px] shrink-0"
      data-name="Tags"
    >
      <div className="absolute border-[#cbec95] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[99.992px]" />
      <div className="font-['Azeret_Mono:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[10px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.4] whitespace-pre">Ecology</p>
      </div>
    </div>
  );
}

function Frame2147203323() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="font-['Gentium_Plus:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[24px] text-left text-neutral-800 w-full">
        <p className="block leading-[1.15]">
          Bacterial Water Quality Monitoring
        </p>
      </div>
    </div>
  );
}

function Frame2147203371() {
  return (
    <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 w-full">
      <Tags2 />
      <Frame2147203323 />
    </div>
  );
}

function Frame4() {
  return (
    <div
      className="absolute left-[-2px] size-4 top-1/2 translate-y-[-50%]"
      data-name="Frame"
    />
  );
}

function Frame2147203313() {
  return (
    <div className="absolute left-1/2 size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
      >
        <g id="Frame 2147203310">
          <path
            d={svgPaths.p30e8a700}
            fill="var(--fill-0, #676767)"
            id="Subtract"
          />
        </g>
      </svg>
    </div>
  );
}

function Icons4() {
  return (
    <div className="relative shrink-0 size-3" data-name="Icons">
      <Frame4 />
      <Frame2147203313 />
    </div>
  );
}

function Frame2147203314() {
  return (
    <div className="box-border content-stretch flex flex-row gap-0.5 items-center justify-start p-0 relative shrink-0 w-full">
      <Icons4 />
      <div className="basis-0 font-['Azeret_Mono:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#676767] text-[10px] text-left uppercase">
        <p className="block leading-[1.4]">Stanislaus National Forest</p>
      </div>
    </div>
  );
}

function Frame2147203324() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="flex items-center justify-center relative shrink-0 w-full">
        <div className="flex-none rotate-[180deg] w-full">
          <div className="h-0 relative w-full">
            <div
              className="absolute bottom-[-0.306px] left-0 right-0 top-[-0.306px]"
              style={
                { "--stroke-0": "rgba(38, 38, 38, 1)" } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 310 2"
              >
                <path
                  d="M0 1H310"
                  id="Vector 71"
                  stroke="var(--stroke-0, #262626)"
                  strokeDasharray="0.33 1.97"
                  strokeWidth="0.611611"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Frame2147203314 />
    </div>
  );
}

function Frame2147203325() {
  return (
    <div className="box-border content-stretch flex flex-col h-[142px] items-start justify-between p-0 relative shrink-0 w-full">
      <Frame2147203371 />
      <Frame2147203324 />
    </div>
  );
}

function BrowseCards2() {
  return (
    <div
      className="[grid-area:1_/_3] bg-[#ffffff] relative rounded shrink-0"
      data-name="Browse Cards"
    >
      <div className="absolute border border-[rgba(38,38,38,0.01)] border-solid inset-0 pointer-events-none rounded" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative size-full">
          <Frame2147203365 />
          <Frame2147203325 />
        </div>
      </div>
    </div>
  );
}

function Frame2147203366() {
  return (
    <div
      className="aspect-[293/195] bg-center bg-cover bg-no-repeat shrink-0 w-full"
      style={{ backgroundImage: `url('${imgFrame2147203366}')` }}
    />
  );
}

function Tags3() {
  return (
    <div
      className="bg-[#dddbfd] box-border content-stretch flex flex-row gap-[9.999px] h-7 items-center justify-center px-[9.999px] py-1 relative rounded-[99.992px] shrink-0"
      data-name="Tags"
    >
      <div className="absolute border-[#c6c3fb] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[99.992px]" />
      <div className="font-['Azeret_Mono:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[10px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.4] whitespace-pre">Astronomy</p>
      </div>
    </div>
  );
}

function Frame2147203326() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="font-['Gentium_Plus:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[24px] text-left text-neutral-800 w-full">
        <p className="block leading-[1.15]">The Milky Way Project</p>
      </div>
    </div>
  );
}

function Frame2147203372() {
  return (
    <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 w-full">
      <Tags3 />
      <Frame2147203326 />
    </div>
  );
}

function Frame5() {
  return (
    <div
      className="absolute left-[-2px] size-4 top-1/2 translate-y-[-50%]"
      data-name="Frame"
    />
  );
}

function Frame2147203315() {
  return (
    <div className="absolute left-1/2 size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
      >
        <g id="Frame 2147203310">
          <path
            d={svgPaths.p30e8a700}
            fill="var(--fill-0, #676767)"
            id="Subtract"
          />
        </g>
      </svg>
    </div>
  );
}

function Icons5() {
  return (
    <div className="relative shrink-0 size-3" data-name="Icons">
      <Frame5 />
      <Frame2147203315 />
    </div>
  );
}

function Frame2147203316() {
  return (
    <div className="box-border content-stretch flex flex-row gap-0.5 items-center justify-start p-0 relative shrink-0 w-full">
      <Icons5 />
      <div className="basis-0 font-['Azeret_Mono:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#676767] text-[10px] text-left uppercase">
        <p className="block leading-[1.4]">Global</p>
      </div>
    </div>
  );
}

function Frame2147203327() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="flex items-center justify-center relative shrink-0 w-full">
        <div className="flex-none rotate-[180deg] w-full">
          <div className="h-0 relative w-full">
            <div
              className="absolute bottom-[-0.306px] left-0 right-0 top-[-0.306px]"
              style={
                { "--stroke-0": "rgba(38, 38, 38, 1)" } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 310 2"
              >
                <path
                  d="M0 1H310"
                  id="Vector 71"
                  stroke="var(--stroke-0, #262626)"
                  strokeDasharray="0.33 1.97"
                  strokeWidth="0.611611"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Frame2147203316 />
    </div>
  );
}

function Frame2147203328() {
  return (
    <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
      <Frame2147203372 />
      <Frame2147203327 />
    </div>
  );
}

function BrowseCards3() {
  return (
    <div
      className="[grid-area:1_/_4] bg-[#ffffff] relative rounded shrink-0"
      data-name="Browse Cards"
    >
      <div className="absolute border border-[rgba(38,38,38,0.01)] border-solid inset-0 pointer-events-none rounded" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative size-full">
          <Frame2147203366 />
          <Frame2147203328 />
        </div>
      </div>
    </div>
  );
}

function Frame2147203367() {
  return (
    <div
      className="aspect-[293/195] bg-center bg-cover bg-no-repeat shrink-0 w-full"
      style={{ backgroundImage: `url('${imgFrame2147203367}')` }}
    />
  );
}

function Tags4() {
  return (
    <div
      className="bg-[#fadcbb] box-border content-stretch flex flex-row gap-[9.999px] h-7 items-center justify-center px-[9.999px] py-1 relative rounded-[99.992px] shrink-0"
      data-name="Tags"
    >
      <div className="absolute border border-[#f7c48d] border-solid inset-0 pointer-events-none rounded-[99.992px]" />
      <div className="font-['Azeret_Mono:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[10px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.4] whitespace-pre">Geology</p>
      </div>
    </div>
  );
}

function Frame2147203329() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="font-['Gentium_Plus:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[24px] text-left text-neutral-800 w-full">
        <p className="block leading-[1.15]">Rim Fire Monitoring</p>
      </div>
    </div>
  );
}

function Frame2147203373() {
  return (
    <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 w-full">
      <Tags4 />
      <Frame2147203329 />
    </div>
  );
}

function Frame6() {
  return (
    <div
      className="absolute left-[-2px] size-4 top-1/2 translate-y-[-50%]"
      data-name="Frame"
    />
  );
}

function Frame2147203330() {
  return (
    <div className="absolute left-1/2 size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
      >
        <g id="Frame 2147203310">
          <path
            d={svgPaths.p30e8a700}
            fill="var(--fill-0, #676767)"
            id="Subtract"
          />
        </g>
      </svg>
    </div>
  );
}

function Icons6() {
  return (
    <div className="relative shrink-0 size-3" data-name="Icons">
      <Frame6 />
      <Frame2147203330 />
    </div>
  );
}

function Frame2147203331() {
  return (
    <div className="box-border content-stretch flex flex-row gap-0.5 items-center justify-start p-0 relative shrink-0 w-full">
      <Icons6 />
      <div className="basis-0 font-['Azeret_Mono:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#676767] text-[10px] text-left uppercase">
        <p className="block leading-[1.4]">Stanislaus National Forest</p>
      </div>
    </div>
  );
}

function Frame2147203332() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="flex items-center justify-center relative shrink-0 w-full">
        <div className="flex-none rotate-[180deg] w-full">
          <div className="h-0 relative w-full">
            <div
              className="absolute bottom-[-0.306px] left-0 right-0 top-[-0.306px]"
              style={
                { "--stroke-0": "rgba(38, 38, 38, 1)" } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 310 2"
              >
                <path
                  d="M0 1H310"
                  id="Vector 71"
                  stroke="var(--stroke-0, #262626)"
                  strokeDasharray="0.33 1.97"
                  strokeWidth="0.611611"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Frame2147203331 />
    </div>
  );
}

function Frame2147203333() {
  return (
    <div className="box-border content-stretch flex flex-col h-[142px] items-start justify-between p-0 relative shrink-0 w-full">
      <Frame2147203373 />
      <Frame2147203332 />
    </div>
  );
}

function BrowseCards4() {
  return (
    <div
      className="[grid-area:2_/_1] bg-[#ffffff] relative rounded shrink-0"
      data-name="Browse Cards"
    >
      <div className="absolute border border-[rgba(38,38,38,0.01)] border-solid inset-0 pointer-events-none rounded" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative size-full">
          <Frame2147203367 />
          <Frame2147203333 />
        </div>
      </div>
    </div>
  );
}

function Frame2147203368() {
  return (
    <div
      className="aspect-[293/195] bg-center bg-cover bg-no-repeat shrink-0 w-full"
      style={{ backgroundImage: `url('${imgFrame2147203368}')` }}
    />
  );
}

function Tags5() {
  return (
    <div
      className="bg-[#feec91] box-border content-stretch flex flex-row gap-[9.999px] h-7 items-center justify-center px-[9.999px] py-1 relative rounded-[99.992px] shrink-0"
      data-name="Tags"
    >
      <div className="absolute border-[#fedf47] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[99.992px]" />
      <div className="font-['Azeret_Mono:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[10px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.4] whitespace-pre">Biology</p>
      </div>
    </div>
  );
}

function Frame2147203334() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="font-['Gentium_Plus:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[24px] text-left text-neutral-800 w-full">
        <p className="block leading-[1.15]">Christmas Bird Count</p>
      </div>
    </div>
  );
}

function Frame2147203374() {
  return (
    <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 w-full">
      <Tags5 />
      <Frame2147203334 />
    </div>
  );
}

function Frame7() {
  return (
    <div
      className="absolute left-[-2px] size-4 top-1/2 translate-y-[-50%]"
      data-name="Frame"
    />
  );
}

function Frame2147203335() {
  return (
    <div className="absolute left-1/2 size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
      >
        <g id="Frame 2147203310">
          <path
            d={svgPaths.p30e8a700}
            fill="var(--fill-0, #676767)"
            id="Subtract"
          />
        </g>
      </svg>
    </div>
  );
}

function Icons7() {
  return (
    <div className="relative shrink-0 size-3" data-name="Icons">
      <Frame7 />
      <Frame2147203335 />
    </div>
  );
}

function Frame2147203336() {
  return (
    <div className="box-border content-stretch flex flex-row gap-0.5 items-center justify-start p-0 relative shrink-0 w-full">
      <Icons7 />
      <div className="basis-0 font-['Azeret_Mono:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#676767] text-[10px] text-left uppercase">
        <p className="block leading-[1.4]">Craters of the moon, ID</p>
      </div>
    </div>
  );
}

function Frame2147203337() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
      <div className="flex items-center justify-center relative shrink-0 w-full">
        <div className="flex-none rotate-[180deg] w-full">
          <div className="h-0 relative w-full">
            <div
              className="absolute bottom-[-0.306px] left-0 right-0 top-[-0.306px]"
              style={
                { "--stroke-0": "rgba(38, 38, 38, 1)" } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 310 2"
              >
                <path
                  d="M0 1H310"
                  id="Vector 71"
                  stroke="var(--stroke-0, #262626)"
                  strokeDasharray="0.33 1.97"
                  strokeWidth="0.611611"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Frame2147203336 />
    </div>
  );
}

function Frame2147203338() {
  return (
    <div className="box-border content-stretch flex flex-col h-[142px] items-start justify-between p-0 relative shrink-0 w-full">
      <Frame2147203374 />
      <Frame2147203337 />
    </div>
  );
}

function BrowseCards5() {
  return (
    <div
      className="[grid-area:2_/_2] bg-[#ffffff] relative rounded shrink-0"
      data-name="Browse Cards"
    >
      <div className="absolute border border-[rgba(38,38,38,0.01)] border-solid inset-0 pointer-events-none rounded" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative size-full">
          <Frame2147203368 />
          <Frame2147203338 />
        </div>
      </div>
    </div>
  );
}

function Frame2147236545() {
  return (
    <div className="basis-0 box-border gap-5 grid grid-cols-[repeat(4,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] grow min-h-px min-w-[800px] p-0 relative shrink-0 w-full">
      <BrowseCards />
      <BrowseCards1 />
      <BrowseCards2 />
      <BrowseCards3 />
      <BrowseCards4 />
      <BrowseCards5 />
    </div>
  );
}

function ProjectList() {
  return (
    <div
      className="bg-[#faf6f2] h-[904px] relative shrink-0 w-full"
      data-name="Project List"
    >
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-6 h-[904px] items-start justify-start pb-10 pt-5 px-10 relative w-full">
          <div className="font-['Hepta_Slab:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[20px] text-left text-neutral-800 tracking-[-0.2px] w-full">
            <p className="block leading-[1.3]">My projects</p>
          </div>
          <Frame2147236545 />
        </div>
      </div>
    </div>
  );
}

function Group2147202951() {
  return (
    <div className="[grid-area:1_/_1] font-['Hepta_Slab:Medium',_sans-serif] font-medium grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative text-[34.174px] text-left text-neutral-800 text-nowrap tracking-[-0.6835px]">
      <div className="[grid-area:1_/_1] ml-[3.154px] mt-0 relative">
        <p className="adjustLetterSpacing block leading-[0.9] text-nowrap whitespace-pre">
          <br />
          Lab
        </p>
      </div>
      <div className="[grid-area:1_/_1] ml-[3.154px] mt-0 relative">
        <p className="adjustLetterSpacing block leading-[0.9] text-nowrap whitespace-pre">
          <br />
          Lab
        </p>
      </div>
      <div className="[grid-area:1_/_1] ml-0 mt-[0.457px] relative">
        <p className="adjustLetterSpacing block leading-[0.9] text-nowrap whitespace-pre">
          Co
        </p>
      </div>
    </div>
  );
}

function Group2147202948() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative">
      <Group2147202951 />
    </div>
  );
}

function Group2147202952() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Group2147202948 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute box-border content-stretch flex flex-row gap-[5px] inset-0 items-center justify-start p-0">
      <div
        className="h-[56.63px] relative shrink-0 w-[47.519px]"
        data-name="Union"
      >
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          role="presentation"
          viewBox="0 0 48 57"
        >
          <g id="Union">
            <path
              clipRule="evenodd"
              d={svgPaths.p1e7e9700}
              fill="var(--fill-0, #262626)"
              fillRule="evenodd"
            />
            <path d={svgPaths.p2489a40} fill="var(--fill-0, #262626)" />
          </g>
        </svg>
      </div>
      <Group2147202952 />
    </div>
  );
}

function Wordmark() {
  return (
    <div
      className="h-[56.633px] relative shrink-0 w-[120px]"
      data-name="Wordmark"
    >
      <Frame1 />
    </div>
  );
}

function Logo1() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-[210px]"
      data-name="Logo"
    >
      <Wordmark />
      <div className="font-['Hepta_Slab:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[14px] text-left text-neutral-800 w-[210px]">
        <p className="block leading-[1.4]">
          Where citizen scientists come together.
        </p>
      </div>
    </div>
  );
}

function Company() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col gap-4 grow items-start justify-start leading-[0] min-h-px min-w-px not-italic p-0 relative shrink-0 text-[14px] text-left text-neutral-800"
      data-name="Company"
    >
      <div
        className="font-['Inter:Semi_Bold',_sans-serif] font-semibold min-w-full relative shrink-0"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[1.01]">Company</p>
      </div>
      <div
        className="font-['Inter:Regular',_sans-serif] font-normal min-w-full relative shrink-0"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[1.01]">About Us</p>
      </div>
      <div className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">How it works</p>
      </div>
      <div className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 w-[86px]">
        <p className="block leading-[1.01]">Community</p>
      </div>
    </div>
  );
}

function Support() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col gap-4 grow items-start justify-start leading-[0] min-h-px min-w-px not-italic p-0 relative shrink-0 text-[14px] text-left text-neutral-800"
      data-name="Support"
    >
      <div
        className="font-['Inter:Semi_Bold',_sans-serif] font-semibold min-w-full relative shrink-0"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[1.01]">Support</p>
      </div>
      <div className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">Help Center</p>
      </div>
      <div className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">Contact Us</p>
      </div>
      <div className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">Submit Feedback</p>
      </div>
    </div>
  );
}

function Learn() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col gap-4 grow items-start justify-start leading-[0] min-h-px min-w-px not-italic p-0 relative shrink-0 text-[14px] text-left text-neutral-800"
      data-name="Learn"
    >
      <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold relative shrink-0 w-full">
        <p className="block leading-[1.01]">Learn</p>
      </div>
      <div className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 w-full">
        <p className="block leading-[1.01]">Newsroom</p>
      </div>
      <div className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 w-full">
        <p className="block leading-[1.01]">Events</p>
      </div>
      <div className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 w-full">
        <p className="block leading-[1.01]">Donate</p>
      </div>
    </div>
  );
}

function Resources() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0 w-[669px]"
      data-name="Resources"
    >
      <Company />
      <Support />
      <Learn />
    </div>
  );
}

function FooterMain() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-start justify-between p-0 relative shrink-0 w-full"
      data-name="Footer main"
    >
      <Logo1 />
      <Resources />
    </div>
  );
}

function Frame2147236506() {
  return (
    <div className="box-border content-stretch flex flex-row font-['Inter:Regular',_sans-serif] font-normal gap-4 items-center justify-start leading-[0] not-italic p-0 relative shrink-0 text-[12px] text-left text-neutral-800 text-nowrap">
      <div className="opacity-60 relative shrink-0">
        <p className="block leading-[1.01] text-nowrap whitespace-pre">
          Privacy Policy
        </p>
      </div>
      <div className="opacity-60 relative shrink-0">
        <p className="block leading-[1.01] text-nowrap whitespace-pre">
          Terms of Service
        </p>
      </div>
      <div className="opacity-60 relative shrink-0">
        <p className="block leading-[1.01] text-nowrap whitespace-pre">
          Cookie Settings
        </p>
      </div>
      <div className="opacity-60 relative shrink-0">
        <p className="block leading-[1.01] text-nowrap whitespace-pre">
          Accessibility
        </p>
      </div>
    </div>
  );
}

function Frame2147236505() {
  return (
    <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[12px] text-left text-neutral-800 text-nowrap">
        <p className="block leading-[1.01] whitespace-pre">
          2025 Co Lab. All rights reserved.
        </p>
      </div>
      <Frame2147236506 />
    </div>
  );
}

function FooterTerms() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Footer terms"
    >
      <div className="h-0 relative shrink-0 w-full">
        <div
          className="absolute bottom-[-0.5px] left-0 right-0 top-[-0.5px]"
          style={{ "--stroke-0": "rgba(38, 38, 38, 1)" } as React.CSSProperties}
        >
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 1428 2"
          >
            <path
              d="M0 1L1428 1.00012"
              id="Vector 3755"
              opacity="0.1"
              stroke="var(--stroke-0, #262626)"
            />
          </svg>
        </div>
      </div>
      <Frame2147236505 />
    </div>
  );
}

function Footer() {
  return (
    <div className="relative shrink-0 w-full" data-name="Footer">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-20 items-start justify-start pb-5 pt-10 px-10 relative w-full">
          <FooterMain />
          <FooterTerms />
        </div>
      </div>
    </div>
  );
}

function Footer1() {
  return (
    <div
      className="bg-[#faf6f2] box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Footer"
    >
      <div className="h-0 relative shrink-0 w-[1440px]">
        <div
          className="absolute bottom-[-0.5px] left-0 right-0 top-[-0.5px]"
          style={{ "--stroke-0": "rgba(38, 38, 38, 1)" } as React.CSSProperties}
        >
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 1440 2"
          >
            <path
              d="M0 1H1440"
              id="Vector 3756"
              opacity="0.1"
              stroke="var(--stroke-0, #262626)"
            />
          </svg>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function DesktopMyProjects() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative size-full"
      data-name="Desktop/My Projects"
    >
      <Navigation />
      <ProjectList />
      <Footer1 />
    </div>
  );
}
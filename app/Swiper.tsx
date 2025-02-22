"use client";

import {
  startTransition,
  unstable_useSwipeTransition as useSwipeTransition,
  unstable_ViewTransition as ViewTransition,
  ViewTransitionInstance,
} from "react";
import SwipeRecognizer from "./SwipeRecognizer";
import { usePathname, useRouter } from "next/navigation";

import transitions from "./Swiper.module.css";

const a = (
  <div key="a">
    <ViewTransition>
      <div>a</div>
    </ViewTransition>
  </div>
);

const b = (
  <div key="b">
    <ViewTransition>
      <div>b</div>
    </ViewTransition>
  </div>
);

export function Swiper() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUrl, startGesture] = useSwipeTransition("/", pathname, "/b");
  const show = currentUrl === "/b";

  function swipeAction() {
    console.log("action");
    startTransition(() => {
      router.push(show ? "/a" : "/b");
    });
  }

  function onTransition(viewTransition: ViewTransitionInstance) {
    const keyframes = [
      { rotate: "0deg", transformOrigin: "30px 8px" },
      { rotate: "360deg", transformOrigin: "30px 8px" },
    ];
    viewTransition.old.animate(keyframes, 250);
    viewTransition.new.animate(keyframes, 250);
  }

  const exclamation = (
    <ViewTransition name="exclamation" onShare={onTransition}>
      <span>!</span>
    </ViewTransition>
  );

  return (
    <div>
      <button
        onClick={() => {
          startTransition(() => {
            router.push(show ? "/a" : "/b");
          });
        }}
      >
        {show ? "Navigate to A" : "Navigate to B"}
      </button>
      <ViewTransition className="none">
        <div>
          <ViewTransition className={transitions["slide-on-nav"]}>
            <h1>{!show ? "A" : "B"}</h1>
          </ViewTransition>
          <ViewTransition
            // @ts-expect-error type def not prepared
            className={{
              "navigation-back": transitions["slide-right"],
              "navigation-forward": transitions["slide-left"],
            }}
          >
            <h1>{!show ? "A" : "B"}</h1>
          </ViewTransition>
          {show ? (
            <div>
              {a}
              {b}
            </div>
          ) : (
            <div>
              {b}
              {a}
            </div>
          )}

          <ViewTransition>
            {show ? <div>hello{exclamation}</div> : <section>Loading</section>}
          </ViewTransition>

          <p></p>
          <p></p>
          <p></p>
          <p></p>
          <p></p>
          <p></p>

          <div className="w-[200px] border border-[#333333] rounded-lg">
            <SwipeRecognizer
              // @ts-expect-error type def not prepared
              gesture={startGesture}
              action={swipeAction}
              direction={show ? "left" : "right"}
            >
              Swipe me
            </SwipeRecognizer>
          </div>

          <p></p>
          <p></p>
          <p></p>
          <p></p>
          <p></p>
          <p></p>

          {show ? null : (
            <ViewTransition>
              <div>world{exclamation}</div>
            </ViewTransition>
          )}
          {show ? <Component /> : null}
        </div>
      </ViewTransition>
    </div>
  );
}

function Component() {
  return (
    <ViewTransition
      className={
        transitions["enter-slide-right"] + " " + transitions["exit-slide-left"]
      }
    >
      <p className="roboto-font">Slide In from Left, Slide Out to Right</p>
    </ViewTransition>
  );
}

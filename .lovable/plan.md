

## Video Player and How It Works Page - Optimal UI Experience

### Overview
Refactor the `/how-it-works` page to include the video player demo and enhance the overall UI experience. This creates a seamless presentation where users can both watch the demo and read detailed information about each step.

### Phase 1: Integrate Video Player into How It Works Page
Add the `HowItWorksVideo` component to the dedicated `/how-it-works` page for a complete experience.

**Changes to `src/pages/HowItWorks.tsx`:**
- Import `HowItWorksVideo` component
- Add video player section after the hero, before the detailed steps
- Create a visual connection between the video and the step-by-step breakdown
- Update "Watch Demo" button to scroll to the video section on the same page

### Phase 2: Fix Mobile Fullscreen Access
The fullscreen button is currently hidden on mobile devices. While native fullscreen may not be supported on all mobile browsers, we should show the button where supported.

**Changes to `src/components/landing/video/VideoControls.tsx`:**
- Remove `hidden sm:flex` from fullscreen button
- Add mobile-friendly fallback (expand to fill container if native fullscreen unavailable)
- Ensure touch-friendly sizing (44px minimum touch targets)

### Phase 3: Audio Synchronization Verification
Verify audio hooks are correctly synchronized with the video timeline.

**Verify in `src/hooks/useVideoAudio.ts` and `src/hooks/useSceneNarration.ts`:**
- Confirm audio files in `/public/audio/` are properly loaded
- Add visual audio indicator showing when audio is playing
- Ensure smooth volume transitions

### Phase 4: Enhance Share Experience
Improve the share dialog and deep-linking.

**Changes to `src/components/landing/video/VideoShareDialog.tsx`:**
- Add email share option
- Add native share button prominence on mobile
- Improve visual hierarchy

**Changes to `src/components/landing/HowItWorksVideo.tsx`:**
- Ensure deep-link scroll behavior works (`#demo-video`)
- Auto-play when navigating directly to video via share link

### Phase 5: UI Polish and Responsive Improvements

**Visual Enhancements:**
1. Add subtle glow effect to video container when playing
2. Improve progress bar visibility with larger hit area
3. Add keyboard shortcuts (Space for play/pause, F for fullscreen, M for mute)
4. Add scene labels tooltip on progress bar hover
5. Improve fullscreen controls layout for better visibility

**Mobile Optimizations:**
1. Larger touch targets for all controls (48px minimum)
2. Swipe gestures for scene navigation
3. Double-tap to play/pause
4. Better responsive scaling for video content

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/HowItWorks.tsx` | Add video player section, update internal links |
| `src/components/landing/video/VideoControls.tsx` | Fix mobile fullscreen, add keyboard shortcuts, improve touch targets |
| `src/components/landing/HowItWorksVideo.tsx` | Add playing glow effect, auto-play on deep-link, scene tooltips |
| `src/components/landing/video/VideoShareDialog.tsx` | Add email share, improve mobile native share |
| `src/components/landing/HowItWorksSection.tsx` | Update share URL to use correct anchor |

### Implementation Details

**Page Structure for /how-it-works:**
```
1. Hero Section (existing)
2. Video Player Demo (NEW - full-width, prominent placement)
3. "Dive Deeper" transition
4. Four Steps breakdown (existing)
5. Capabilities Section (existing)
6. Comparison Section (existing)
7. CTA Section (existing)
```

**Keyboard Shortcuts:**
- `Space` - Play/Pause
- `F` - Toggle fullscreen
- `M` - Toggle mute
- `Left Arrow` - Previous scene
- `Right Arrow` - Next scene
- `R` - Reset

**Visual Playing Indicator:**
- Subtle pulsing glow around video container when playing
- Audio waveform animation in volume button when audio is active


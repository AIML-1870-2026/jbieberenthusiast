# Interactive Decision Neuron - Specification

## Project Overview
Build an interactive web application that visualizes and trains a single-neuron decision model for the decision: **"Should I text my crush?"** Users can plot training examples, watch the neuron learn step-by-step, and explore which factors matter most through sensitivity analysis.

## Decision Domain

**Domain:** "Should I text my crush?"

**Decision Output:**
- **GO FOR IT** = Text them (probability ≥ 0.5)
- **HOLD OFF** = Don't text yet (probability < 0.5)

**Real-world context:** The anxious, overthinking decision everyone faces when deciding whether to reach out to someone they're interested in. This combines emotional factors (confidence, anxiety) with contextual clues (time since last text, perceived interest level).

## Input Features (5 inputs)

1. **Confidence Level** (0-10 scale)
   - Description: How confident and self-assured are you feeling right now?
   - Range: 0 (very insecure) to 10 (very confident)
   - Expected weight: **Positive** (higher confidence → more likely to text)

2. **Time Since Last Conversation** (0-10 scale)
   - Description: How much time has passed since you last talked?
   - Range: 0 (just talked) to 10 (been a long time)
   - Expected weight: **Positive** (more time passed → less "spammy" to text again)

3. **Likelihood They're Interested** (0-10 scale)
   - Description: Based on past signals, how interested do they seem?
   - Range: 0 (no signs of interest) to 10 (clear mutual interest)
   - Expected weight: **Positive** (more interest → more likely to text)

4. **Time of Day Appropriateness** (0-10 scale)
   - Description: Is this a good time to text? (not too late, not too early)
   - Range: 0 (3am, terrible time) to 10 (perfect timing like evening)
   - Expected weight: **Positive** (better timing → more likely to text)

5. **Anxiety/Fear Factor** (0-10 scale)
   - Description: Combined measure of anxiety about texting and fear of being annoying
   - Range: 0 (no anxiety, totally chill) to 10 (extremely anxious and worried)
   - Expected weight: **Negative** (more anxiety → less likely to text)

## Bias (Tendency)

**Interpretation:** "Baseline tendency to reach out"

**Meaning:** 
- Positive bias = naturally bold and likely to text (confident/outgoing default)
- Negative bias = naturally cautious and hesitant to text (overthinking default)
- Zero bias = neutral, let the inputs decide

**Range:** -5 to +5 (adjustable by user via slider)

## Neural Network Model

**Activation Function:** Sigmoid
```
output = 1 / (1 + e^(-z))
where z = (w1·Confidence + w2·TimeSince + w3·Interest + w4·TimeOfDay + w5·Anxiety + bias)
```

**Output Interpretation:**
- Output value: 0 to 1 (probability of "GO FOR IT")
- Decision threshold: 0.5
- Display as percentage: "73% confidence to text"

## Decision Boundary Visualization

### 2D Plot Configuration
**X-axis:** Confidence Level (0-10)
**Y-axis:** Likelihood They're Interested (0-10)

These create interesting decision quadrants:
- High confidence + high interest = obvious "go for it"
- Low confidence + high interest = "they like me but I'm nervous"
- High confidence + low interest = "feeling bold but risky"
- Low confidence + low interest = obvious "hold off"

**Fixed values for other inputs during visualization:**
- Time Since Last Conversation: 5 (moderate time has passed)
- Time of Day Appropriateness: 7 (good time, like evening)
- Anxiety/Fear Factor: 5 (moderate anxiety)

### Visual Elements
1. **Scatter plot area:** 500px × 500px (responsive, mobile-friendly)
2. **Decision boundary line:** Calculated from current weights, animated when updated
3. **Region coloring (Valentine's theme):**
   - "GO FOR IT" region (above line): Soft pink/rose (#ffe4e8 or similar)
   - "HOLD OFF" region (below line): Soft lavender/purple (#f3e5f5 or similar)
4. **Data points:**
   - "GO FOR IT" examples: Pink/red hearts (♥) or filled circles
   - "HOLD OFF" examples: Purple/blue hearts (💜) or filled circles
   - Point size: 10-12px
   - Hover effect: Enlarge point, show tooltip with all 5 input values + label
5. **Styling touches:**
   - Romantic color palette (pinks, reds, purples, rose gold accents)
   - Subtle heart decorations (not overwhelming)
   - Smooth, modern design

### Decision Boundary Math
The boundary line is where output = 0.5, which means:
```
w1·Confidence + w2·(5) + w3·Interest + w4·(7) + w5·(5) + bias = 0

Solving for Interest (Y-axis):
Interest = -(w1·Confidence + w2·5 + w4·7 + w5·5 + bias) / w3
```

## Training Mode (Step-by-Step Learning)

### Adding Training Examples
**Method:** Click anywhere on the 2D plot to add a point

**Labeling System:** Two-button toggle
- Button 1: "GO FOR IT" - pink/red button with heart icon
- Button 2: "HOLD OFF" - purple/blue button with different icon
- Currently selected label is highlighted with glow/border
- New points take the currently selected label
- Click existing point to toggle its label (with smooth color transition)

**Point Data Storage:**
Each point stores all 5 inputs:
- Confidence Level: X-coordinate from plot
- Time Since Last Conversation: 5 (fixed)
- Likelihood They're Interested: Y-coordinate from plot
- Time of Day Appropriateness: 7 (fixed)
- Anxiety/Fear Factor: 5 (fixed)
- Label: GO FOR IT (1) or HOLD OFF (0)

**Training data represents:** Mix of past real situations and hypothetical scenarios

### Training Algorithm

**Learning Method:** Gradient Descent
- Learning rate: 0.1 (adjustable via slider, range 0.01 to 1.0)
- Update rule per step:
  ```
  For each training example (x, y_true):
    1. Calculate prediction: y_pred = sigmoid(w·x + bias)
    2. Calculate error: error = y_true - y_pred
    3. Update weights: w_i = w_i + learning_rate × error × x_i
    4. Update bias: bias = bias + learning_rate × error
  ```

**Training Controls:**
1. **"Step" button:** 
   - Runs ONE gradient descent iteration through all points
   - Shows animated update of decision boundary (500ms smooth transition)
   - Updates display values (weights, accuracy, step count)
   - Visual feedback: pulse effect on points being processed
   - Large, prominent button (primary action)

2. **"Train" button:**
   - Runs 10 steps automatically with delays
   - 200ms pause between steps for visibility
   - Shows "Training..." status indicator
   - Can be interrupted/stopped
   - Secondary button style

3. **"Reset" button:**
   - Clears all training points
   - Resets weights to initial values (user-specified or small random values)
   - Resets bias to initial value
   - Resets step counter to 0
   - Keeps input configuration
   - Warning/danger button style (require confirmation?)

### Training Metrics Display

**Real-time Display Panel:**

1. **Current Weights:** Show all 5 weights with their input labels
   ```
   💪 Confidence Level: +2.34
   ⏰ Time Since Last: +1.87
   💕 Likelihood Interested: +3.12
   🕐 Time of Day: +0.56
   😰 Anxiety/Fear: -1.23
   ```
   Use emojis or icons for visual interest

2. **Bias:** Show current bias value
   ```
   🎯 Baseline Tendency: -0.45
   ```

3. **Step Counter:** "Training Steps: 127"

4. **Accuracy:** Calculate on training data
   ```
   ✓ Accuracy: 87.5% (14/16 correct)
   ```
   - Correct = (prediction ≥ 0.5 and label = GO FOR IT) OR (prediction < 0.5 and label = HOLD OFF)

5. **Learning Rate:** Display current value with slider control
   ```
   Learning Rate: 0.10 [slider]
   ```

## User Interface Layout

### Main Panels

**Left Panel (35-40% width):**

**Section 1: Initial Setup**
- Weight initialization options:
  - Random small values (-0.5 to 0.5)
  - Manual entry for each weight
  - "Smart defaults" based on expected signs
- Bias slider (-5 to +5) with label "Baseline Tendency to Reach Out"
- Learning rate slider (0.01 to 1.0)

**Section 2: Training Controls**
- Label selection toggle (GO FOR IT / HOLD OFF)
  - Large, clear buttons
  - Visual indication of selected label
- Action buttons:
  - **Step** (large, primary, pink/red)
  - **Train** (medium, secondary)
  - **Reset** (small, warning style)

**Section 3: Metrics Display**
- Current weights (all 5 with icons)
- Current bias
- Step counter
- Accuracy percentage
- Display in card/panel format with Valentine's theme styling

**Right Panel (60-65% width):**

**Decision Boundary Visualization**
- 2D scatter plot (main focus)
- Animated decision boundary line
- Region shading (GO FOR IT / HOLD OFF areas)
- Axis labels:
  - X: "Confidence Level 💪" (0-10)
  - Y: "Likelihood They're Interested 💕" (0-10)
- Light grid lines for easier point placement
- Legend showing point colors/symbols

### Visual Feedback & Animations

**Training Step Animation:**
1. Highlight points being processed (gentle pulse/glow effect)
2. Smoothly transition decision boundary line (500ms ease-in-out)
3. Update region shading with fade transition (300ms)
4. Flash/highlight weight values that changed significantly (>0.5 change)
5. Update accuracy with smooth number count-up animation
6. Confetti or heart animation on accuracy improvements? (optional, Valentine's theme)

**Point Interaction:**
- **Hover:** Enlarge point slightly, show tooltip with all 5 input values and label
- **Click existing point:** Toggle label with color change animation (300ms)
- **Add new point:** Drop-in animation with small bounce

**Button States:**
- Hover effects with scale/color changes
- Disabled states when no points exist
- Loading/active states during training

## BONUS FEATURE: Sensitivity Analysis

### Purpose
Show which inputs actually matter most to the neuron's decision. Help users understand the relative influence of each factor.

### Implementation: Collapsible Panel

**Trigger:**
- Button labeled "📊 Show Sensitivity Analysis" (or "Analyze Input Influence")
- Located at bottom of left panel or floating button
- Valentine's theme styling (pink/purple accent)

**Behavior:**
- Click to expand/slide in panel from right side or bottom
- Smooth animation (300ms ease-in-out)
- Button text changes to "Hide Sensitivity Analysis" or icon toggles
- Click again or X button to collapse
- Does not obstruct main visualization

### Sensitivity Panel Content

**Layout:** 5 mini line charts in compact grid (3 on top row, 2 on bottom row)

**Each Line Chart Shows:**
1. **Chart title:** Input name with icon (e.g., "💪 Confidence Level")
2. **X-axis:** Input value swept from 0 to 10
3. **Y-axis:** Probability of "GO FOR IT" (0% to 100%)
4. **Line:** Shows how output changes as this input varies
   - Positive weight inputs: slope upward
   - Negative weight (Anxiety): slopes downward
   - Steep slope = very influential
   - Flat slope = doesn't matter much
5. **Vertical marker line:** Shows current/default value for that input
6. **Styling:** Match Valentine's theme, use pink/purple gradient for lines

**Calculation Method:**
For each input:
- Hold all other inputs at their current/default values
- Sweep target input from 0 to 10 (20-30 data points for smooth line)
- Calculate output probability at each point
- Plot the curve

**Update Behavior:**
- Recalculates whenever weights or bias change
- Updates in real-time after training steps
- Smooth transition animation when curves change

**Additional Info (optional):**
- Show "sensitivity score" = max output - min output for each input
- Rank inputs by influence with small text below charts
- Tooltip on hover showing exact values

### Visual Design
- Compact but readable (each chart ~150px x 100px)
- Shared Y-axis scale (0-100%) for easy comparison
- Light background to distinguish from main panel
- Subtle Valentine's theme (heart-shaped markers at current value?)

## Responsive Design

**Desktop (>1024px):**
- Side-by-side panels as described
- Full-size visualizations
- Sensitivity panel slides from right

**Tablet (768px - 1024px):**
- Slightly narrower panels
- Maintain side-by-side layout
- Smaller fonts/spacing

**Mobile (<768px):**
- Stack panels vertically
- Controls on top, visualization below
- Sensitivity panel expands from bottom
- Touch-friendly button sizes (min 44px)
- Simplified grid layout for sensitivity charts (2x2 + 1)

## Technical Requirements

**Framework:** Modern JavaScript (React recommended for state management)

**Libraries:**
- Plotting: D3.js, Chart.js, or Plotly for visualizations
- Animations: CSS transitions + requestAnimationFrame for smooth updates
- Math: Native JavaScript Math object (sigmoid, dot product)

**Performance:**
- Smooth 60fps animations
- Debounce rapid training clicks
- Efficient redrawing (only update what changed)

**Accessibility:**
- Keyboard navigation for all controls
- Screen reader labels for buttons/sliders
- Color contrast meeting WCAG AA standards
- Alt text for visual elements

## Success Criteria

**Core Functionality:**
- ✅ Users can add training points by clicking
- ✅ Step-by-step training updates weights smoothly
- ✅ Decision boundary visualizes correctly and animates
- ✅ Accuracy and metrics update in real-time
- ✅ Reset clears everything properly

**Visual Polish:**
- ✅ Valentine's theme is cohesive and attractive
- ✅ Animations are smooth and purposeful
- ✅ Mobile-responsive layout works well
- ✅ Clear visual feedback for all interactions

**Educational Value:**
- ✅ Users understand what each input does
- ✅ Training process is transparent and observable
- ✅ Decision boundary makes geometric sense
- ✅ Sensitivity analysis reveals input importance

**Bonus Points:**
- ✅ Sensitivity analysis panel implemented and functional
- ✅ Charts accurately show input influence
- ✅ Updates dynamically as neuron learns
- ✅ Compact, non-intrusive design

## Stretch Goals (Beyond Bonus)

If time permits:
- Save/load training scenarios
- Export decision boundary as image
- Multiple neurons comparison mode
- Real-time "should I text now?" calculator with live inputs
- Share your trained neuron with friends
- Animation showing gradient descent in weight space

---

## Notes for Implementation

**Weight Initialization:**
Start with small random values or user-specified values that respect the expected signs (positive for most, negative for anxiety).

**Edge Cases to Handle:**
- No training points yet (disable Step/Train buttons)
- All points same label (show warning)
- Division by zero in boundary calculation (handle gracefully)
- Very large/small weight values (clip or warn)

**Color Palette Suggestions (Valentine's Theme):**
- Primary pink: #FF69B4 (hot pink)
- Soft pink: #FFE4E8 (backgrounds)
- Purple: #9C27B0 or #E1BEE7 (accents)
- Red: #E91E63 (hearts, go for it)
- White/cream: #FFF5F7 (backgrounds)
- Dark text: #4A4A4A (contrast)

**Icon/Emoji Suggestions:**
- Confidence: 💪 or ✨
- Time Since: ⏰ or 📅
- Interest: 💕 or 💗
- Time of Day: 🕐 or ☀️
- Anxiety: 😰 or 🥴
- Bias: 🎯 or ⚖️

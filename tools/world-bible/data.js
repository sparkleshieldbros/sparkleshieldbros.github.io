window.SSB_WORLD_BIBLE = {
  pipelineStages: [
    { id: "story", label: "Story Approved" },
    { id: "references", label: "References Ready" },
    { id: "prompt", label: "Prompt Approved" },
    { id: "art_progress", label: "Art In Progress" },
    { id: "art_review", label: "Art Review" },
    { id: "art_approved", label: "Art Approved" },
    { id: "photoshop", label: "Photoshop Complete" },
    { id: "dimensions", label: "Dimensions Verified" },
    { id: "indesign", label: "InDesign Placed" },
    { id: "proofread", label: "Proofread" },
    { id: "preflight", label: "Preflight Passed" },
    { id: "proof", label: "Proof Approved" },
    { id: "final", label: "Final" }
  ],

  books: [
    {
      id: "EO",
      title: "The Echo Ogre",
      subtitle: "A Sparkle Shield Bros choice-path adventure",
      status: "active",
      currentSpreadId: "EO-SP01",
      coverAssetId: "EO_COVER",
      manifestPath: "assets/images/production/SparkleShieldUniverse/03_StoryContinuity/EchoOgre/spreads.json",
      goal: "Create cohesive spreads that teach calm, kindness, courage, and repair without losing the fun of a superhero adventure.",
      printTarget: "KDP paperback production through Photoshop cleanup and InDesign layout."
    }
  ],

  assets: [
    {
      id: "EO_COVER",
      title: "The Echo Ogre cover",
      type: "story",
      group: "Book cover",
      purpose: "Public-facing cover and adventure identity.",
      path: "../../adventures/echo-ogre/images/echo-ogre-choice-path-cover.webp"
    },
    {
      id: "EO_OPENING",
      title: "Opening scene",
      type: "story",
      group: "Echo Ogre story scenes",
      purpose: "First appearance on Maplewood Terrace at dusk.",
      path: "../../adventures/echo-ogre/images/opening.webp"
    },
    {
      id: "EO_RUSH",
      title: "Rush path action",
      type: "story",
      group: "Echo Ogre story scenes",
      purpose: "Captain Cash rushes; the echo grows louder and faster.",
      path: "../../adventures/echo-ogre/images/choice-rush.webp"
    },
    {
      id: "EO_PAUSE",
      title: "Pause path consequence",
      type: "story",
      group: "Echo Ogre story scenes",
      purpose: "Kairo pauses and notices the copying pattern.",
      path: "../../adventures/echo-ogre/images/consequence-pause.webp"
    },
    {
      id: "EO_HELP",
      title: "Dad repair conversation",
      type: "story",
      group: "Echo Ogre story scenes",
      purpose: "Dad models listening, apology, and repair.",
      path: "../../adventures/echo-ogre/images/consequence-help.webp"
    },
    {
      id: "EO_RUSH_REALIZATION",
      title: "Rush realization",
      type: "story",
      group: "Echo Ogre story scenes",
      purpose: "The team sees that rushing escalates the echo.",
      path: "../../adventures/echo-ogre/images/rush-realization.webp"
    },
    {
      id: "EO_PAUSE_REALIZATION",
      title: "Pause realization",
      type: "story",
      group: "Echo Ogre story scenes",
      purpose: "The team observes that calm echoes back as calm.",
      path: "../../adventures/echo-ogre/images/pause-realization.webp"
    },
    {
      id: "EO_DAD_REALIZATION",
      title: "Breathing together",
      type: "story",
      group: "Echo Ogre story scenes",
      purpose: "The family practices calm breathing and kind hands.",
      path: "../../adventures/echo-ogre/images/dad-realization.webp"
    },
    {
      id: "EO_END_FAST",
      title: "Fast hands ending",
      type: "story",
      group: "Echo Ogre endings",
      purpose: "A caution ending where rushing leaves the block tense.",
      path: "../../adventures/echo-ogre/images/ending-fast.webp"
    },
    {
      id: "EO_END_WISE",
      title: "Bubble pause ending",
      type: "story",
      group: "Echo Ogre endings",
      purpose: "A wise ending where pattern recognition settles the echo.",
      path: "../../adventures/echo-ogre/images/ending-wise.webp"
    },
    {
      id: "EO_END_TRUE",
      title: "Sparkle Shield ending",
      type: "story",
      group: "Echo Ogre endings",
      purpose: "True ending where the Echo Ogre becomes a guardian of care.",
      path: "../../adventures/echo-ogre/images/ending-true.webp"
    },

    {
      id: "BBK_MODEL",
      title: "Bubble Boy model and proportions",
      type: "character",
      group: "Bubble Boy Kairo",
      purpose: "Approved model, proportions, and key placement.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/BubbleBoy_Kairo/BBK-001A_ModelSheet_TurnaroundProportions.png"
    },
    {
      id: "BBK_TURN",
      title: "Bubble Boy turnaround",
      type: "character",
      group: "Bubble Boy Kairo",
      purpose: "360 degree costume and silhouette reference.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/BubbleBoy_Kairo/BBK-001_Turnaround.png"
    },
    {
      id: "BBK_ACTION",
      title: "Bubble Boy action poses",
      type: "character",
      group: "Bubble Boy Kairo",
      purpose: "Bubble shield, launch, recovery, and movement poses.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/BubbleBoy_Kairo/BBK-003_ActionPoseSheet.png"
    },
    {
      id: "BBK_EXP",
      title: "Bubble Boy expressions",
      type: "character",
      group: "Bubble Boy Kairo",
      purpose: "Face, brow, mouth, and phoneme consistency.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/BubbleBoy_Kairo/BBK-004_ExpressionPhonemeSheet.png"
    },
    {
      id: "CC_MODEL",
      title: "Captain Cash construction",
      type: "character",
      group: "Captain Cash",
      purpose: "Approved construction, costume, and silhouette.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/CaptainCash/CC-002_ConstructionGuide.png"
    },
    {
      id: "CC_ACTION",
      title: "Captain Cash poses",
      type: "character",
      group: "Captain Cash",
      purpose: "Motion, expression, and heroic action reference.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/CaptainCash/CC-003_PoseReference.png"
    },
    {
      id: "CC_EXP",
      title: "Captain Cash expressions",
      type: "character",
      group: "Captain Cash",
      purpose: "Expression and acting consistency.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/CaptainCash/CC-004_Expressions.png"
    },
    {
      id: "DAD_MODEL",
      title: "Dad construction",
      type: "character",
      group: "Dad",
      purpose: "Approved Dad construction and costume guide.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/Dad/DAD-002_ConstructionGuide.png"
    },
    {
      id: "DAD_ACTION",
      title: "Dad action and performance",
      type: "character",
      group: "Dad",
      purpose: "Protection, movement, support, and calm leader acting.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/Dad/DAD-003_ActionPerformanceGuide.png"
    },
    {
      id: "DAD_EXP",
      title: "Dad expressions",
      type: "character",
      group: "Dad",
      purpose: "Calm, concern, listening, repair, and leadership faces.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/Dad/DAD-004_ExpressionActingGuide.png"
    },
    {
      id: "MOM_MODEL",
      title: "Mom construction",
      type: "character",
      group: "Mom",
      purpose: "Approved Mom proportions and costume.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/Mom/MOM-002_ConstructionGuide.png"
    },
    {
      id: "MOM_ACTION",
      title: "Mom action and performance",
      type: "character",
      group: "Mom",
      purpose: "Strength, protection, compassion, and repair motion.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/Mom/MOM-003_ActionPerformanceGuide.png"
    },
    {
      id: "MOM_EXP",
      title: "Mom expressions",
      type: "character",
      group: "Mom",
      purpose: "Nurturing, focused, protective, and heroic calm faces.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/Mom/MOM-004_ExpressionActingGuide.png"
    },
    {
      id: "NN_MODEL",
      title: "Ninja Nugs construction",
      type: "character",
      group: "Ninja Nugs",
      purpose: "Approved construction and costume.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/NinjaNugs/NN-002_ConstructionGuide.png"
    },
    {
      id: "NN_ACTION",
      title: "Ninja Nugs action",
      type: "character",
      group: "Ninja Nugs",
      purpose: "Movement, pause, timing, and sidekick action.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/NinjaNugs/NN-003_ActionPerformanceGuide.png"
    },
    {
      id: "NN_EXP",
      title: "Ninja Nugs expressions",
      type: "character",
      group: "Ninja Nugs",
      purpose: "Expression and acting guide.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/NinjaNugs/NN-004_ExpressionActingGuide.png"
    },
    {
      id: "EOG_MODEL",
      title: "Echo Ogre construction",
      type: "character",
      group: "Echo Ogre",
      purpose: "Approved translucent body, spiral core, and scale.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/EchoOgre/EOG-002_ConstructionGuide.png"
    },
    {
      id: "EOG_ACTION",
      title: "Echo Ogre action",
      type: "character",
      group: "Echo Ogre",
      purpose: "Movement, attack, landing, compassion, and personality poses.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/EchoOgre/EOG-003_ActionPerformanceGuide.png"
    },
    {
      id: "EOG_EXP",
      title: "Echo Ogre expressions",
      type: "character",
      group: "Echo Ogre",
      purpose: "Kind, curious, worried, scared, sad, and proud expressions.",
      path: "../../assets/images/production/SparkleShieldUniverse/01_Characters/EchoOgre/EOG-004_FacialExpressionSheet.png"
    },

    {
      id: "MT01_HOME",
      title: "Family Home location sheet",
      type: "environment",
      group: "Maplewood Terrace",
      purpose: "Family home exterior, lot, camera, and continuity.",
      path: "../../assets/images/production/SparkleShieldUniverse/02_Environment/MT-01_FamilyHome/MT01-002_ConstructionLocationSheet.png"
    },
    {
      id: "MT01I_KITCHEN",
      title: "Family kitchen location sheet",
      type: "environment",
      group: "Maplewood Terrace",
      purpose: "Interior kitchen layout, props, light, and camera.",
      path: "../../assets/images/production/SparkleShieldUniverse/02_Environment/MT-01I_Kitchen/MT01I-002_DetailedLocationSheet.png"
    },
    {
      id: "MT04_GREEN",
      title: "Neighborhood Green detailed sheet",
      type: "environment",
      group: "Maplewood Terrace",
      purpose: "Green, play space, garden beds, cameras, and story states.",
      path: "../../assets/images/production/SparkleShieldUniverse/02_Environment/MT-04_NeighborhoodGreen/MT04-002_DetailedLocationSheet.png"
    },
    {
      id: "MT06_FLOATING",
      title: "Floating Garden detailed sheet",
      type: "environment",
      group: "Maplewood Terrace",
      purpose: "Floating garden structure, ecology, cameras, and lighting.",
      path: "../../assets/images/production/SparkleShieldUniverse/02_Environment/MT-06_FloatingGarden/MT06-002_DetailedLocationSheet.png"
    },
    {
      id: "ENV_MASTER_EO",
      title: "Echo Ogre master environment board",
      type: "guide",
      group: "World guides",
      purpose: "Story-specific world mood, environment pillars, and emotional stages.",
      path: "../../assets/images/production/SparkleShieldUniverse/02_Environment/World/ENV-001_EchoOgreMasterEnvironmentBoard.png"
    },
    {
      id: "ENV_CONTINUITY",
      title: "Maplewood Terrace continuity map",
      type: "guide",
      group: "World guides",
      purpose: "Neighborhood geography, route logic, and location relationships.",
      path: "../../assets/images/production/SparkleShieldUniverse/02_Environment/World/ENV-007_MaplewoodTerraceContinuityMap.png"
    },
    {
      id: "ENV_STATES",
      title: "Environmental state guide",
      type: "guide",
      group: "World guides",
      purpose: "Healthy, disturbed, manifestation, pause, repair, and restored states.",
      path: "../../assets/images/production/SparkleShieldUniverse/02_Environment/World/ENV-006_EnvironmentalStateGuide.png"
    },
    {
      id: "ENV_DETERIORATION",
      title: "Environmental deterioration strip",
      type: "guide",
      group: "World guides",
      purpose: "How unresolved emotions change the neighborhood visually.",
      path: "../../assets/images/production/SparkleShieldUniverse/02_Environment/World/ENV-005_EnvironmentalDeteriorationStrip.png"
    }
  ],

  spreads: [
    {
      id: "EO-SP01",
      bookId: "EO",
      spread: 1,
      pages: "1-2",
      title: "The Echo Ogre Appears",
      beat: "EO-B01",
      sceneAssetId: "EO_OPENING",
      status: "references",
      location: "Maplewood Terrace, dusk",
      environmentState: "Manifestation begins",
      camera: "Wide establishing storybook stage",
      storyText: "Purple lights flicker. The Echo Ogre copies every brave choice.",
      objective: "Introduce wonder, danger, and the rule that strong feelings echo back.",
      references: ["EO_OPENING", "BBK_MODEL", "CC_MODEL", "NN_MODEL", "EOG_MODEL", "MT04_GREEN", "ENV_MASTER_EO", "ENV_STATES"]
    },
    {
      id: "EO-SP02",
      bookId: "EO",
      spread: 2,
      pages: "3-4",
      title: "Choose a First Helper",
      beat: "EO-B02",
      sceneAssetId: "EO_OPENING",
      status: "story",
      approvedCanonical: true,
      canonicalDecision: "Use the current interactive story-flow version: outdoor first-helper choice on Maplewood Terrace. The older kitchen/theme-stated matrix row is retained as historical planning context only.",
      location: "Maplewood Terrace street",
      environmentState: "Concern",
      camera: "Medium group composition with clear hero options",
      storyText: "The team must choose who helps first.",
      objective: "Frame the first decision as calm, pause, or listening.",
      primaryRead: "Three helper choices are emotionally distinct at a glance: breathe, pause, or listen.",
      emotionalTurn: "The family moves from surprise into intentional choice.",
      conflict: "The Echo Ogre grows when everyone reacts without noticing the pattern.",
      readerDiscovery: "Children can spot that each helper offers a different kind of strength.",
      pageTurn: "Invite the reader to choose a helper and see what that choice changes.",
      visualInfo: "Keep Bubble Boy, Ninja Nugs, and Dad readable as distinct helper options.",
      withheld: "Do not reveal which choice creates the strongest repair yet.",
      avoid: "Avoid making the choice feel like a fight menu or a video-game attack screen.",
      references: ["BBK_ACTION", "DAD_EXP", "NN_ACTION", "EOG_EXP", "MT04_GREEN", "ENV_CONTINUITY"],
      referenceTiers: {
        mandatory: ["BBK_ACTION", "DAD_EXP", "NN_ACTION", "EOG_EXP", "MT04_GREEN"],
        conditional: ["ENV_CONTINUITY"],
        inspirational: []
      },
      conflicts: [
        {
          source: "Beat_Reference_Matrix.md",
          status: "resolved",
          issue: "Older planning row names Beat02 as kitchen/theme-stated/healthy, while the current production spread is the outdoor first-helper choice.",
          decision: "Canonical spread record supersedes the old matrix row for EO-SP02."
        }
      ],
      qualityGates: {
        imageComplement: true,
        thumbnailRead: true,
        characterPerformance: true,
        worldSpecificity: true,
        rereadDiscovery: true,
        bookRhythm: true
      }
    },
    {
      id: "EO-SP03",
      bookId: "EO",
      spread: 3,
      pages: "5-6",
      title: "Fast Hands",
      beat: "EO-B03",
      sceneAssetId: "EO_RUSH",
      status: "references",
      location: "Maplewood Terrace street",
      environmentState: "Escalation",
      camera: "Action diagonal, Captain Cash moving toward the Echo Ogre",
      storyText: "Cash rushed in. The Echo Ogre copied him louder.",
      objective: "Show that fast action without awareness makes the problem bigger.",
      references: ["EO_RUSH", "CC_ACTION", "CC_EXP", "BBK_ACTION", "NN_ACTION", "EOG_ACTION", "ENV_DETERIORATION"]
    },
    {
      id: "EO-SP04",
      bookId: "EO",
      spread: 4,
      pages: "7-8",
      title: "Watching the Pattern",
      beat: "EO-B04",
      sceneAssetId: "EO_PAUSE",
      status: "references",
      location: "Maplewood Terrace street",
      environmentState: "Pause",
      camera: "Quiet observation, distance between heroes and echo",
      storyText: "Kairo watched quietly. Calm made the Echo Ogre softer.",
      objective: "Make stillness feel active and heroic.",
      references: ["EO_PAUSE", "BBK_EXP", "CC_EXP", "NN_ACTION", "EOG_EXP", "MT04_GREEN", "ENV_STATES"]
    },
    {
      id: "EO-SP05",
      bookId: "EO",
      spread: 5,
      pages: "9-10",
      title: "Dad Kneels Down",
      beat: "EO-B05",
      sceneAssetId: "EO_HELP",
      status: "references",
      location: "Maplewood Terrace street",
      environmentState: "First repair",
      camera: "Low, warm, close enough for emotional clarity",
      storyText: "Dad said sorry. The Echo Ogre listened.",
      objective: "Show adult repair as strength, not weakness.",
      references: ["EO_HELP", "DAD_MODEL", "DAD_EXP", "BBK_EXP", "CC_EXP", "EOG_EXP", "ENV_MASTER_EO"]
    },
    {
      id: "EO-SP06",
      bookId: "EO",
      spread: 6,
      pages: "11-12",
      title: "Noticing What Happened",
      beat: "EO-B06",
      sceneAssetId: "EO_RUSH_REALIZATION",
      status: "prompt",
      location: "Maplewood Terrace street",
      environmentState: "Escalation slowing",
      camera: "Reflective bubbles show repeated action",
      storyText: "Cash slowed down. Hard moments can still be repaired.",
      objective: "Turn a mistake into a learnable, repairable moment.",
      references: ["EO_RUSH_REALIZATION", "CC_EXP", "BBK_EXP", "NN_EXP", "EOG_EXP", "ENV_STATES"]
    },
    {
      id: "EO-SP07",
      bookId: "EO",
      spread: 7,
      pages: "13-14",
      title: "Calm In, Calm Out",
      beat: "EO-B07",
      sceneAssetId: "EO_PAUSE_REALIZATION",
      status: "prompt",
      location: "Maplewood Terrace street",
      environmentState: "Pause",
      camera: "Centered bubble reflection and soft Echo Ogre posture",
      storyText: "The Echo Ogre echoed everything, even quiet.",
      objective: "Make pattern recognition visible through bubbles and ripples.",
      references: ["EO_PAUSE_REALIZATION", "BBK_ACTION", "CC_EXP", "NN_EXP", "EOG_EXP", "ENV_STATES"]
    },
    {
      id: "EO-SP08",
      bookId: "EO",
      spread: 8,
      pages: "15-16",
      title: "A Breath Together",
      beat: "EO-B08",
      sceneAssetId: "EO_DAD_REALIZATION",
      status: "prompt",
      location: "Maplewood Terrace street",
      environmentState: "Repair begins",
      camera: "Warm family grouping, hands visible, breathing rhythm implied",
      storyText: "The family breathed together. The street grew softer.",
      objective: "Give readers a clear body-based calming tool.",
      references: ["EO_DAD_REALIZATION", "DAD_ACTION", "BBK_EXP", "CC_EXP", "NN_EXP", "EOG_EXP", "ENV_STATES"]
    },
    {
      id: "EO-SP09",
      bookId: "EO",
      spread: 9,
      pages: "22-23",
      title: "The Ogre Watches",
      beat: "EO-B09",
      sceneAssetId: "EO_PAUSE_REALIZATION",
      status: "prompt",
      approvedCanonical: true,
      location: "Maplewood Terrace landmarks",
      environmentState: "Stalled repair / Unease",
      camera: "200 mm telephoto view from behind the Echo Ogre, with the Ogre as a soft foreground silhouette watching the brothers",
      storyText: "Something still wasn't right. The Echo Ogre watched.",
      objective: "Shift from action to psychological suspense: show that kindness paused the imbalance but did not fully heal it, and that the Ogre is learning.",
      references: ["BBK_EXP", "CC_EXP", "DAD_EXP", "MOM_EXP", "EOG_EXP", "ENV_STATES", "ENV_MASTER_EO", "MT04_GREEN"],
      referenceTiers: {
        mandatory: ["EOG_EXP", "ENV_STATES", "ENV_MASTER_EO", "MT04_GREEN"],
        conditional: ["BBK_EXP", "CC_EXP", "DAD_EXP", "MOM_EXP"],
        inspirational: []
      },
      qualityGates: {
        imageComplement: true,
        thumbnailRead: true,
        characterPerformance: true,
        worldSpecificity: true,
        rereadDiscovery: true,
        bookRhythm: true
      }
    },
    {
      id: "EO-SP10",
      bookId: "EO",
      spread: 10,
      pages: "24-25",
      title: "When the Neighborhood Forgot",
      beat: "EO-B10",
      sceneAssetId: "ENV_DETERIORATION",
      status: "prompt",
      approvedCanonical: true,
      location: "Maplewood Terrace overhead",
      environmentState: "Stalled repair / Sadness",
      camera: "High overhead 35 mm view, nearly straight down, with the neighborhood as the subject",
      storyText: "The music faded again. Bubble Boy whispered, \"We didn't fix it.\"",
      objective: "Create the emotional low point: one kind moment paused the imbalance, but true repair takes sustained relationships.",
      references: ["BBK_EXP", "CC_EXP", "DAD_EXP", "MOM_EXP", "EOG_EXP", "ENV_STATES", "ENV_MASTER_EO", "ENV_DETERIORATION", "MT04_GREEN"],
      referenceTiers: {
        mandatory: ["ENV_STATES", "ENV_MASTER_EO", "ENV_DETERIORATION", "MT04_GREEN", "EOG_EXP"],
        conditional: ["BBK_EXP", "CC_EXP", "DAD_EXP", "MOM_EXP"],
        inspirational: []
      },
      qualityGates: {
        imageComplement: true,
        thumbnailRead: true,
        characterPerformance: true,
        worldSpecificity: true,
        rereadDiscovery: true,
        bookRhythm: true
      }
    },
    {
      id: "EO-SP11",
      bookId: "EO",
      spread: 11,
      pages: "21-22",
      title: "Bubble Shield",
      beat: "EO-B11",
      sceneAssetId: "EO_RUSH",
      status: "story",
      location: "Maplewood Terrace street",
      environmentState: "Protection",
      camera: "Bubble shield separates fear from family",
      storyText: "Kairo protected everyone without attacking.",
      objective: "Show protection as calm boundaries, not aggression.",
      references: ["BBK_ACTION", "BBK_MODEL", "EOG_ACTION", "MT04_GREEN", "ENV_STATES"]
    },
    {
      id: "EO-SP12",
      bookId: "EO",
      spread: 12,
      pages: "23-24",
      title: "Repair Words",
      beat: "EO-B12",
      sceneAssetId: "EO_HELP",
      status: "story",
      location: "Maplewood Terrace street",
      environmentState: "Repair",
      camera: "Dad and children, calm faces, softened purple echo behind them",
      storyText: "Sorry opened a door that shouting could not.",
      objective: "Make apology concrete and emotionally safe.",
      references: ["DAD_EXP", "DAD_ACTION", "BBK_EXP", "CC_EXP", "EOG_EXP", "ENV_STATES"]
    },
    {
      id: "EO-SP13",
      bookId: "EO",
      spread: 13,
      pages: "25-26",
      title: "Fast Hands Ending",
      beat: "EO-B13",
      sceneAssetId: "EO_END_FAST",
      status: "references",
      location: "Maplewood Terrace street",
      environmentState: "Escalation remains",
      camera: "Large Echo Ogre, smaller heroes, tense block",
      storyText: "Rushing made the Echo Ogre bigger, not better.",
      objective: "Deliver a clear consequence without shame.",
      references: ["EO_END_FAST", "CC_EXP", "BBK_EXP", "NN_EXP", "EOG_ACTION", "ENV_DETERIORATION"]
    },
    {
      id: "EO-SP14",
      bookId: "EO",
      spread: 14,
      pages: "27-28",
      title: "Bubble Pause Ending",
      beat: "EO-B14",
      sceneAssetId: "EO_END_WISE",
      status: "references",
      location: "Maplewood Terrace street",
      environmentState: "Pause resolves",
      camera: "Soft, reflective, everyone calm and low to the ground",
      storyText: "Quiet attention turned wild color into soft bubbles.",
      objective: "Reward observation and patient attention.",
      references: ["EO_END_WISE", "BBK_EXP", "CC_EXP", "NN_EXP", "EOG_EXP", "ENV_STATES"]
    },
    {
      id: "EO-SP15",
      bookId: "EO",
      spread: 15,
      pages: "29-30",
      title: "Sparkle Shield Ending",
      beat: "EO-B15",
      sceneAssetId: "EO_END_TRUE",
      status: "references",
      approvedCanonical: true,
      location: "Maplewood Terrace street",
      environmentState: "Restored",
      camera: "Heroic family tableau with guardian Echo Ogre",
      storyText: "The Echo Ogre stopped echoing fear and echoed kindness.",
      objective: "Give the true ending a warm, triumphant family finish.",
      references: ["EO_END_TRUE", "BBK_MODEL", "CC_MODEL", "DAD_MODEL", "MOM_MODEL", "NN_MODEL", "EOG_MODEL", "ENV_STATES"],
      referenceTiers: {
        mandatory: ["EO_END_TRUE", "BBK_MODEL", "CC_MODEL", "DAD_MODEL", "MOM_MODEL", "NN_MODEL", "EOG_MODEL", "ENV_STATES"],
        conditional: [],
        inspirational: []
      },
      qualityGates: {
        imageComplement: true,
        thumbnailRead: true,
        characterPerformance: true,
        worldSpecificity: true,
        rereadDiscovery: true,
        bookRhythm: true
      }
    },
    {
      id: "EO-SP16",
      bookId: "EO",
      spread: 16,
      pages: "31-32",
      title: "Family Practice Page",
      beat: "EO-B16",
      sceneAssetId: "EO_END_TRUE",
      status: "story",
      location: "Family home or Maplewood Terrace",
      environmentState: "Restored",
      camera: "Clean instructional composition with family warmth",
      storyText: "Stop. Breathe. Notice. Choose. Repair.",
      objective: "Close with a repeatable family practice for readers.",
      references: ["DAD_EXP", "MOM_EXP", "BBK_EXP", "CC_EXP", "NN_EXP", "MT01_HOME", "ENV_MASTER_EO"]
    }
  ]
};

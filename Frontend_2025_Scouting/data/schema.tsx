// Base interfaces
interface RobotBase {
    team_num: number;
    regional: string;
}

interface RobotRank extends RobotBase {
    rank_value: number;
}

interface RobotPitData extends RobotBase {
    vision_sys: string | null;
    drive_train: string | null;
    
    ground_intake: boolean | null;
    source_intake: boolean | null;

    L1_scoring: boolean | null;
    L2_scoring: boolean | null;
    L3_scoring: boolean | null;
    L4_scoring: boolean | null;

    remove: boolean | null;
    processor: boolean | null;
    net: boolean | null;

    climb_deep: boolean | null;
    climb_shallow: boolean | null;
    
    comments: string | null;
}

interface Robot extends RobotRank {
    picture_path: string | null;
    vision_sys: string | null;
    drive_train: string | null;
    
    ground_intake: boolean | null;
    source_intake: boolean | null;

    L1_scoring: boolean | null;
    L2_scoring: boolean | null;
    L3_scoring: boolean | null;
    L4_scoring: boolean | null;

    remove: boolean | null;
    processor: boolean | null;
    net: boolean | null;

    climb_deep: boolean | null;
    climb_shallow: boolean | null;

    matches: TeamMatchBase[];

    avg_algae_scored: number | null;
    avg_algae_removed: number | null;
    avg_algae_processed: number | null;
    avg_algae: number | null;
    avg_L1: number | null;
    avg_L2: number | null;
    avg_L3: number | null;
    avg_L4: number | null;
    avg_coral: number | null;

    comments: string | null;
}

interface RobotStats extends RobotRank {
    avg_algae_scored: number;
    avg_algae_removed: number;
    avg_algae_processed: number;
    avg_algae: number;
    avg_L1: number;
    avg_L2: number;
    avg_L3: number;
    avg_L4: number;
    avg_coral: number;
}

interface RobotCoralKeyData extends RobotBase {
    avgL1: number;
    avgL2: number;
    avgL3: number;
    avgL4: number;
    avg: number;
}

interface RobotAlgaeKeyData extends RobotBase {
    avgRemoved: number;
    avgProcessed: number;
    avgScored: number;
    avg: number;
}

// Match related interfaces
interface TeamMatchBase {
    match_num: number;
    team_num: number;
    regional: string;
}

interface TeamMatchInit extends TeamMatchBase {
    team: Robot;
}

interface TeamMatchPregame extends TeamMatchBase {
    auto_starting_position: number;
}

interface TeamMatch extends TeamMatchBase {
    auto_starting_position: number;
    auto_taxi: boolean;
    algae: Algae[];
    coral: Coral[];
    climb_deep: boolean;
    climb_shallow: boolean;
    park: boolean;
    disabled: boolean;
    comments: string;
}

interface TeamMatchAuto extends TeamMatchBase {
    algae: Algae[];
    coral: Coral[];
}

interface TeamMatchTele extends TeamMatchBase {
    algae: Algae[];
    coral: Coral[];
    
    climb_deep: boolean;
    climb_shallow: boolean;
    park: boolean;
}

interface TeamMatchPostGame extends TeamMatchBase {
    driverRating: number;
    disabled: boolean;
    defence: boolean;
    malfunction: boolean;
    noShow: boolean;
    comments: string;
}

interface TeamMatchResponse extends TeamMatchBase {
    auto_starting_position: number;
    // auto_taxi: boolean;
    climb_deep: boolean;
    climb_shallow: boolean;
    park: boolean;
    driverRating: number;
    disabled: boolean;
    defence: boolean;
    malfunction: boolean;
    noShow: boolean;
    comments: string;
    match_algae: AlgaeAllStats;
    match_coral: CoralMatchData;
}

// Algae related interfaces
interface AlgaeBase {
    team_num: number;
    match_num: number;
    regional: string;
}

interface Algae extends AlgaeBase {
    where_scored: string;
    made: boolean;
    timestamp: string; // String representation of timedelta. Can be changed to seconds later
}

// Coral related interfaces
interface CoralBase {
    team_num: number;
    match_num: number;
    regional: string;
}

interface Coral extends CoralBase {
    level: number;
    made: boolean;
    timestamp: string; // i.e. P3D
}

interface CoralLevelData {
    total_made: number;
    total: number;
}

interface CoralData {
    L1: CoralLevelData;
    L2: CoralLevelData;
    L3: CoralLevelData;
    L4: CoralLevelData;
}

interface CoralMatchData extends CoralLevelData {
    match_num: number;
    L1: CoralLevelData;
    L2: CoralLevelData;
    L3: CoralLevelData;
    L4: CoralLevelData;
}

// Statistics interfaces
interface AlgaeStats {
    total: number;
}

interface AlgaeProcessed extends AlgaeStats {
    processed: number;
}

interface AlgaeAllStats extends AlgaeProcessed {
    removed: number;
    net: number;
}

interface SortFieldParams {
    RANK: boolean;
    ALGAE_SCORED: boolean;
    ALGAE_REMOVED: boolean;
    ALGAE_PROCESSED: boolean;
    ALGAE_AVG: boolean;
    CORAL_L1: boolean;
    CORAL_L2: boolean;
    CORAL_L3: boolean;
    CORAL_L4: boolean;
    CORAL_AVG: boolean;
  }

interface ClimbData {
    deep: number,
    shallow: number,
    park: number,
    total: number
}
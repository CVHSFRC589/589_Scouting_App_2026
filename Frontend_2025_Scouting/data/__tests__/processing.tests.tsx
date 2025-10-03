// Import the API service to be tested
import { mock } from 'node:test';
import { robotApiService } from '../processing';
import { json } from 'stream/consumers';

// Mock the global fetch function with Jest's mocking capability
let BASE_URL = "http://127.0.0.1:8000/tests"

global.fetch = jest.fn();

// Create a test suite for robotApiService
describe('processing', () => {
  // Before each test, clear all mock function calls to start fresh
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // First test case: successful robot fetch
  test('getRobotAll successfully fetches robot', async () => {
    // Create a mock response that matches the exact API response structure
    const mockRobot = [
      {
        "team_num": 0,
      }
    ];

    // Mock the fetch function to return a successful response
    // 'ok: true' indicates a successful HTTP response
    // 'json()' method returns the mocked robot data
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockRobot)
    });

    // Call the function being tested
    const result = await robotApiService.getAllRobots("oc");

    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/tests/robots/oc');
    
    // Verify the returned data matches the mock data
    expect(result).toEqual(mockRobot);
  });

  // Second test case: handling a failed fetch
  test('getAllRobots throws error for failed fetch', async () => {
    // Mock a failed response (ok: false)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });

    // Verify that the function throws an error when fetch fails
    await expect(robotApiService.getAllRobots('testRegional'))
      .rejects.toThrow('Failed to fetch robots');
  });

  test('getRobot fetches robot data', async () => {
    
    const mockRobot = {
        "team_num": 5285,
        "rank_value": 26,
        "picture_path": null,
        "climb_deep": null,
        "climb_shallow": null,
        "algae": null,
        "coral": null,
        "matches": [
          {
            "match_num": 2,
            "team_num": 5285,
            "regional": "oc"
          },
          {
            "match_num": 12,
            "team_num": 5285,
            "regional": "oc"
          }
        ]
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRobot)
    });
    
    const data = await robotApiService.getRobot(5285);
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/get/5285`);
    expect(data).toEqual(mockRobot);
  });

  // test('addRobotImage uploads an image', async () => {
  //     (fetch as jest.Mock).mockResolvedValueOnce({
  //         ok: true,
  //         json: jest.fn().mockResolvedValue({ success: true })
  //     });
      
  //     const file = new File(['dummy content'], 'robot.jpg', { type: 'image/jpeg' });
  //     const data = await robotApiService.addRobotImage(1234, file);
  //     expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/add_picture/1234`, expect.objectContaining({ method: 'POST' }));
  //     expect(data).toEqual({ success: true });
  // });

  test('addTeamMatchData sends team match data', async () => {
    
    const mockMatchData = {
        "match_num": 0,
        "team_num": 0,
        "regional": "string",
        "auto_starting_position": 0,
        "auto_taxi": true,
        "algae": [
          {
            "team_num": 0,
            "match_num": 0,
            "regional": "string",
            "where_scored": "string",
            "made": true,
            "timestamp": "P3D"
          }
        ],
        "coral": [
          {
            "team_num": 0,
            "match_num": 0,
            "regional": "string",
            "level": 0,
            "made": true,
            "timestamp": "P3D"
          }
        ],
        "climb_deep": true,
        "climb_shallow": true,
        "park": true,
        "disabled": true,
        "comments": "string"
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMatchData)
    });
    
    const matchData = { team: 1234, score: 50 };
    const data = await robotApiService.addTeamMatchData(mockMatchData);
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/matches`, expect.objectContaining({ method: 'PUT' }));
    expect(data).toEqual(mockMatchData);
  });

  test('updateRobotRank updates rank', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue("Updated Ranks")
      });
      
      const data = await robotApiService.updateRobotRank('oc');
      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/robot/rank/oc`, expect.objectContaining({ method: 'PUT' }));
      expect(data).toEqual("Updated Ranks");
  });

  test('updateAverageCoralMatch updates coral match stats', async () => {
    
    const mockCoral = {
      "team_num": 0,
      "avgL1": 0,
      "avgL2": 0,
      "avgL3": 0,
      "avgL4": 0,
      "avg": 0
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockCoral)
    });
      
    const data = await robotApiService.updateAverageCoralMatch(5285, 'oc');
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/stats/coral/5285/oc/avg`, expect.objectContaining({ method: 'PUT' }));
    expect(data).toEqual(mockCoral);
  });

  test('updateAverageAlgaeMatch updates algae match stats', async () => {
    
    const mockAlgae = {
      "team_num": 0,
      "avgRemoved": 0,
      "avgProcessed": 0,
      "avgScored": 0,
      "avg": 0
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockAlgae)
      });
      
      const data = await robotApiService.updateAverageAlgaeMatch(5285, 'oc');
      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/stats/algae/5285/oc/avg`, expect.objectContaining({ method: 'PUT' }));
      expect(data).toEqual(mockAlgae);
  });

  test('updatePitData successfully updates pit scouting data', async () => {
    const mockPitData: RobotPitData = {
        team_num: 5285,
        vision_sys: "limelight",
        drive_train: "swerve",
        
        ground_intake: true,
        source_intake: false,

        L1_scoring: true,
        L2_scoring: true,
        L3_scoring: false,
        L4_scoring: false,

        remove: true,
        processor: false,
        net: true,

        climb_deep: true,
        climb_shallow: false
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
            status_code: 201,
            detail: "Updated pit scouting data"
        })
    });

    const result = await robotApiService.updatePitData(5285, mockPitData);

    expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/scouting/pit/5285`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockPitData)
        }
    );
    expect(result).toEqual({
        status_code: 201,
        detail: "Updated pit scouting data"
    });
  });

    // test('updatePitData throws error for failed update', async () => {
    //     const mockPitData: RobotPitData = {
    //         team_num: 5285,
    //         climb_deep: true,
    //         climb_shallow: false,
    //         algae: "all",
    //         coral: "L1"
    //     };

    //     (fetch as jest.Mock).mockResolvedValueOnce({
    //         ok: false
    //     });

    //     await expect(robotApiService.updatePitData(5285, 'testRegional', mockPitData))
    //         .rejects.toThrow('Failed to update pit scouting data');
    // });





  test('getSortedRobots successfully fetches sorted robots with new schema', async () => {
    const mockSortedRobots: RobotStats[] = [
      {
        team_num: 1,
        rank_value: 1,
        avg_algae_scored: 10.5,
        avg_algae_removed: 8.2,
        avg_algae_processed: 9.1,
        avg_algae: 9.3,
        avg_L1: 5.4,
        avg_L2: 4.2,
        avg_L3: 3.1,
        avg_L4: 2.0,
        avg_coral: 3.675
      }
    ];

    const mockParams: SortFieldParams = {
      RANK: true,
      ALGAE_SCORED: true,
      ALGAE_REMOVED: true,
      ALGAE_PROCESSED: true,
      ALGAE_AVG: false,
      CORAL_L1: false,
      CORAL_L2: false,
      CORAL_L3: false,
      CORAL_L4: false,
      CORAL_AVG: true
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockSortedRobots)
    });

    const result = await robotApiService.getSortedRobots(mockParams);

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/robots/sorted`,
      // expect.objectContaining({"method": "POST"})
    );
    expect(result).toEqual(mockSortedRobots);
  });

});
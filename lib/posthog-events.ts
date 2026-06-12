export type JobSearchStartedProperties = {
  userId: string;
  jobTitle: string;
  location: string;
};

export type JobFoundProperties = {
  userId: string;
  source: "search";
  matchScore: number;
};

export type ProfileCompletedProperties = {
  userId: string;
};

export type CompanyResearchedProperties = {
  userId: string;
  jobId: string;
  company: string;
};

export type PostHogEventPayload =
  | {
      event: "job_search_started";
      properties: JobSearchStartedProperties;
    }
  | {
      event: "job_found";
      properties: JobFoundProperties;
    }
  | {
      event: "profile_completed";
      properties: ProfileCompletedProperties;
    }
  | {
      event: "company_researched";
      properties: CompanyResearchedProperties;
    };

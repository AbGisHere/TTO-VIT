import { TechnologyBriefData } from '../types/technologyBrief';

export const defaultEmptyBriefData: TechnologyBriefData = {
  techId: '',
  title: '',
  titleBannerBgColor: '#76cb3c',
  domains: [],
  applications: [],
  trlLevel: 1,
  patentStatus: 'Patent Pending',
  patentApplicationNo: '',
  priorityDate: '',
  leadInventor: '',
  inventorDesignation: '',
  coInventors: [],
  contactInfo: {
    name: 'Mr. Manish Kumar',
    title: 'Sr. Technology Transfer Officer',
    department: 'IP&TT Cell, VIT-IST',
    institution: 'VIT Vellore',
    email: 'manish.k@vit.ac.in',
    phoneOffice: '+91 416 220 4330',
    phoneMobile: '+91 83099 93511',
    website: 'https://vit.ac.in/iprcell'
  },
  published: true,
  sections: [
    // Page 1 Default Sections
    {
      id: 'sec-domain',
      title: 'Technology Domain',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 1,
      blocks: [
        {
          id: 'blk-domain-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-applications',
      title: 'Applications',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 1,
      blocks: [
        {
          id: 'blk-app-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-problem',
      title: 'Problem Statement',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 1,
      blocks: [
        {
          id: 'blk-prob-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-results',
      title: 'Results',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 1,
      blocks: [
        {
          id: 'blk-res-1',
          type: 'image',
          imageUrl: ''
        }
      ]
    },
    {
      id: 'sec-solution',
      title: 'Technological Solution',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 1,
      blocks: [
        {
          id: 'blk-sol-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-summary',
      title: 'Technology Summary',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 2,
      page: 1,
      blocks: [
        {
          id: 'blk-sum-1',
          type: 'text',
          content: ''
        }
      ]
    },

    // Page 2 Default Sections
    {
      id: 'sec-usp',
      title: 'Technical USP',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 2,
      page: 2,
      blocks: [
        {
          id: 'blk-usp-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-results-page2',
      title: 'Results',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 2,
      blocks: [
        {
          id: 'blk-res-p2-1',
          type: 'image',
          imageUrl: ''
        }
      ]
    },
    {
      id: 'sec-comp-adv',
      title: 'Competitive Advantage',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: 2,
      blocks: [
        {
          id: 'blk-comp-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-ip-stage',
      title: 'IP & Development Stage',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 2,
      blocks: [
        {
          id: 'blk-ip-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-value-prop',
      title: 'Value Proposition',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 2,
      blocks: [
        {
          id: 'blk-val-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-market',
      title: 'Market Potential',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'right',
      page: 2,
      blocks: [
        {
          id: 'blk-mkt-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    },
    {
      id: 'sec-research-lab',
      title: 'Research Lab',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 2,
      page: 2,
      blocks: [
        {
          id: 'blk-lab-1',
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    }
  ]
};

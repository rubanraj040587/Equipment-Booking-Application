

import { Equipment, EquipmentStatus, ChecklistItem, InspectionRecord } from './types';

export const INITIAL_FLEET: Equipment[] = [
  // SPM Assets
  { id: 'SPM1293', name: 'SPM', model: 'SLAVE PALLET MOVER LEHF 75-D 508MM / 7.5T; LEHF75D', status: EquipmentStatus.AVAILABLE, batteryLevel: 95 },
  { id: 'SPM1522', name: 'SPM', model: 'SLAVE PALLET MOVER LEHF 75-D 508MM / 7.5T; LEHF75D', status: EquipmentStatus.AVAILABLE, batteryLevel: 88 },
  { id: 'SPM13', name: 'SPM', model: 'SLAVE PALLET MOVER - ESG 7700 - PU / 7.5T', status: EquipmentStatus.AVAILABLE, batteryLevel: 92 },
  { id: 'SPM12', name: 'SPM', model: 'SLAVE PALLET MOVER - ESG 7700 - PU / 7.5T', status: EquipmentStatus.AVAILABLE, batteryLevel: 76 },
  { id: 'SPM01', name: 'SPM', model: 'SLAVE PALLET MOVER - ESG 7700 - (DA ASSET) / 7.5T', status: EquipmentStatus.AVAILABLE, batteryLevel: 85 },
  { id: 'SPM03', name: 'SPM', model: 'SLAVE PALLET MOVER - ESG 7700 - (DA ASSET) / 7.5T', status: EquipmentStatus.AVAILABLE, batteryLevel: 90 },

  // Diesel Forklifts
  { id: 'FKLDSL533', name: 'Diesel Forklift', model: '5Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL590', name: 'Diesel Forklift', model: '5Ton Diesel Forklift ( CATERPILLAR )', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL279', name: 'Diesel Forklift', model: '5Ton Diesel Forklift (CLARK)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL413', name: 'Diesel Forklift', model: '5Ton Diesel Forklift (UNICARRIER)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL217', name: 'Diesel Forklift', model: '5Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL354', name: 'Diesel Forklift', model: '5Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL348', name: 'Diesel Forklift', model: '5Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL175', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (KOMATSU)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL176', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (KOMATSU)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL579', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL576', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL552', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL595', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL593', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL592', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },
  { id: 'FKLDSL591', name: 'Diesel Forklift', model: '3Ton Diesel Forklift (TOYOTA)', status: EquipmentStatus.AVAILABLE, batteryLevel: 100 },

  // Battery Forklifts
  { id: 'FKL1845', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30', status: EquipmentStatus.AVAILABLE, batteryLevel: 98 },
  { id: 'FKL1917', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 95 },
  { id: 'FKL1862', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30 I', status: EquipmentStatus.AVAILABLE, batteryLevel: 82 },
  { id: 'FKL1843', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30', status: EquipmentStatus.AVAILABLE, batteryLevel: 88 },
  { id: 'FKL1731', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30 I', status: EquipmentStatus.AVAILABLE, batteryLevel: 75 },
  { id: 'FKL1880', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 91 },
  { id: 'FKL1916', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 93 },
  { id: 'FKL1744', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30 I', status: EquipmentStatus.AVAILABLE, batteryLevel: 79 },
  { id: 'FKL1879', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 84 },
  { id: 'FKL1513', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30', status: EquipmentStatus.AVAILABLE, batteryLevel: 72 },
  { id: 'FKL1800', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30', status: EquipmentStatus.AVAILABLE, batteryLevel: 96 },
  { id: 'FKL1801', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30', status: EquipmentStatus.AVAILABLE, batteryLevel: 97 },
  { id: 'FKL1802', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30', status: EquipmentStatus.AVAILABLE, batteryLevel: 89 },
  { id: 'FKL1872', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30', status: EquipmentStatus.AVAILABLE, batteryLevel: 90 },
  { id: 'FKL1878', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 94 },
  { id: 'FKL1734', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30 I', status: EquipmentStatus.AVAILABLE, batteryLevel: 81 },
  { id: 'FKL1865', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-30 I', status: EquipmentStatus.AVAILABLE, batteryLevel: 83 },
  { id: 'FKL1877', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 87 },
  { id: 'FKL1934', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 92 },
  { id: 'FKL1933', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 95 },
  { id: 'FKL1935', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 88 },
  { id: 'FKL304', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 78 },
  { id: 'FKL309', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 80 },
  { id: 'FKL303', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 82 },
  { id: 'FKL307', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 85 },
  { id: 'FKL306', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 89 },
  { id: 'FKL308', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 91 },
  { id: 'FKL305', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 86 },
  { id: 'FKL310', name: 'Battery Forklift', model: 'FORK LIFT STILL RX60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 93 },
  { id: 'FKL1844', name: 'Battery Forklift', model: 'FORK LIFT STILL R60-35', status: EquipmentStatus.AVAILABLE, batteryLevel: 84 },
];

export const PRE_SHIFT_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', category: 'Visual', label: 'Tires & Wheels condition', checked: false },
  { id: 'c2', category: 'Visual', label: 'Forks & Backrest (No cracks/bends)', checked: false },
  { id: 'c3', category: 'Visual', label: 'Overhead Guard clear', checked: false },
  { id: 'c4', category: 'Fluid', label: 'Hydraulic Oil Level', checked: false },
  { id: 'c5', category: 'Fluid', label: 'Battery Water Level / Charge', checked: false },
  { id: 'c6', category: 'Fluid', label: 'No visible leaks under machine', checked: false },
  { id: 'c7', category: 'Operational', label: 'Brakes (Service & Parking)', checked: false },
  { id: 'c8', category: 'Operational', label: 'Steering controls', checked: false },
  { id: 'c9', category: 'Operational', label: 'Lift & Tilt controls', checked: false },
  { id: 'c10', category: 'Operational', label: 'Horn & Safety Lights', checked: false },
];

export const MOCK_INSPECTION_HISTORY: InspectionRecord[] = [
  { id: '1', forkliftNumber: 'FKL101', name: 'Operator A', staffNumber: 'S10001', areaOfWork: 'Breakdown', date: '2024-02-19', timestamp: Date.now() - 86400000 * 1, externalCondition: 'Yes', fireExtinguisher: 'Yes', batterySecured: 'Yes', brakes: 'Yes', horn: 'Yes', steering: 'Yes', issuesFound: false, actionTaken: 'NA' },
  { id: '2', forkliftNumber: 'FKL102', name: 'Operator B', staffNumber: 'S10002', areaOfWork: 'RFS', date: '2024-02-19', timestamp: Date.now() - 86400000 * 2, externalCondition: 'Yes', fireExtinguisher: 'Yes', batterySecured: 'Yes', brakes: 'Yes', horn: 'Yes', steering: 'Yes', issuesFound: false, actionTaken: 'NA' },
  { id: '3', forkliftNumber: 'FKL103', name: 'Operator C', staffNumber: 'S10003', areaOfWork: 'Build-up', date: '2024-02-19', timestamp: Date.now() - 86400000 * 3, externalCondition: 'Yes', fireExtinguisher: 'Yes', batterySecured: 'Yes', brakes: 'Yes', horn: 'Yes', steering: 'Yes', issuesFound: false, actionTaken: 'NA' },
  { id: '4', forkliftNumber: 'FKL104', name: 'Operator D', staffNumber: 'S10004', areaOfWork: 'Breakdown', date: '2024-02-21', timestamp: Date.now() - 10000000, externalCondition: 'Yes', fireExtinguisher: 'No', batterySecured: 'No', brakes: 'No', horn: 'No', steering: 'No', issuesFound: true, actionTaken: 'Inform RA & Supervisors' },
  { id: '5', forkliftNumber: 'FKL105', name: 'Operator E', staffNumber: 'S10005', areaOfWork: 'Delivery', date: '2024-02-19', timestamp: Date.now() - 20000000, externalCondition: 'No', fireExtinguisher: 'Yes', batterySecured: 'Yes', brakes: 'Yes', horn: 'No', steering: 'Yes', issuesFound: true, actionTaken: 'Need Maintenance' },
  { id: '6', forkliftNumber: 'FKL106', name: 'Operator F', staffNumber: 'S10006', areaOfWork: 'Acceptance', date: '2024-02-19', timestamp: Date.now() - 30000000, externalCondition: 'Yes', fireExtinguisher: 'No', batterySecured: 'Yes', brakes: 'Yes', horn: 'Yes', steering: 'Yes', issuesFound: true, actionTaken: 'Inform RA & Supervisors' },
  { id: '7', forkliftNumber: 'FKL107', name: 'Operator G', staffNumber: 'S10007', areaOfWork: 'Breakdown', date: '2024-02-19', timestamp: Date.now() - 40000000, externalCondition: 'No', fireExtinguisher: 'Yes', batterySecured: 'Yes', brakes: 'Yes', horn: 'Yes', steering: 'Yes', issuesFound: true, actionTaken: 'Need Maintenance' },
  { id: '8', forkliftNumber: 'FKL108', name: 'Operator H', staffNumber: 'S10008', areaOfWork: 'RFS', date: '2024-02-21', timestamp: Date.now() - 5000000, externalCondition: 'Yes', fireExtinguisher: 'No', batterySecured: 'No', brakes: 'No', horn: 'Yes', steering: 'Yes', issuesFound: true, actionTaken: 'Inform RA & Supervisors' },
];

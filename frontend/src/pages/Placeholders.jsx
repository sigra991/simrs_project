import React from 'react';

const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="font-h1 text-h1 text-on-surface">{title}</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
        Halaman {title} sedang dalam pengembangan.
      </p>
    </div>
    <div className="glass-card rounded-xl p-12 flex items-center justify-center text-outline">
      <span className="material-symbols-outlined text-[48px] mr-4">construction</span>
      <span className="text-xl">Under Construction</span>
    </div>
  </div>
);

export const Patients = () => <PlaceholderPage title="Patients" />;
export const MedicalRecords = () => <PlaceholderPage title="Medical Records" />;
export const Inventory = () => <PlaceholderPage title="Inventory" />;
export const Users = () => <PlaceholderPage title="Users" />;

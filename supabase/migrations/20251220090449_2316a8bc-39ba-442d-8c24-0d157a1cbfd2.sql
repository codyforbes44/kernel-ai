-- Enable realtime for builder_projects and project_files for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE builder_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE project_files;
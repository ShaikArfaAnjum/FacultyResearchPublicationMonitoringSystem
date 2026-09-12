"""Initial schema for Research Faculty Monitoring System

Revision ID: 0001_initial
Revises: 
Create Date: 2026-09-11 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension if available
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 1. users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='faculty'),
        sa.Column('faculty_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # 2. faculty_profiles
    op.create_table(
        'faculty_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('raw_name', sa.String(255), nullable=False),
        sa.Column('normalized_name', sa.String(255), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=True),
        sa.Column('middle_name', sa.String(100), nullable=True),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('institutional_email', sa.String(255), nullable=True, unique=True),
        sa.Column('personal_email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('employee_id', sa.String(50), nullable=True, unique=True),
        sa.Column('date_of_joining', sa.Date(), nullable=True),
        sa.Column('date_of_leaving', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('employment_status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('primary_affiliation', sa.String(500), nullable=True),
        sa.Column('past_affiliations', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('research_interests', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('total_publications', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('verified_publications', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_citations', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('h_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('i10_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('declared_publication_count', sa.Integer(), nullable=True),
        sa.Column('declared_citation_count', sa.Integer(), nullable=True),
        sa.Column('declared_h_index', sa.Float(), nullable=True),
        sa.Column('source_csv_row', sa.Integer(), nullable=True),
        sa.Column('profile_completion_pct', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_faculty_profiles_normalized_name', 'faculty_profiles', ['normalized_name'])
    op.create_index('ix_faculty_profiles_department', 'faculty_profiles', ['department'])
    op.create_index('ix_faculty_profiles_institutional_email', 'faculty_profiles', ['institutional_email'])
    op.create_index('ix_faculty_profiles_employee_id', 'faculty_profiles', ['employee_id'])

    # Add foreign key from users.faculty_id to faculty_profiles.id
    op.create_foreign_key(
        'fk_users_faculty_id',
        'users', 'faculty_profiles',
        ['faculty_id'], ['id']
    )

    # 3. faculty_identifiers
    op.create_table(
        'faculty_identifiers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('faculty_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('faculty_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('identifier_type', sa.String(50), nullable=False),
        sa.Column('identifier_value', sa.String(255), nullable=False),
        sa.Column('identifier_url', sa.Text(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('verification_status', sa.String(30), nullable=False, server_default='discovered'),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('identifier_type', 'identifier_value', name='uq_identifier_type_value'),
    )
    op.create_index('ix_faculty_identifiers_faculty_id', 'faculty_identifiers', ['faculty_id'])
    op.create_index('ix_faculty_identifiers_type_val', 'faculty_identifiers', ['identifier_type', 'identifier_value'])

    # 4. faculty_name_variants
    op.create_table(
        'faculty_name_variants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('faculty_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('faculty_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('variant_name', sa.String(255), nullable=False),
        sa.Column('normalized_variant', sa.String(255), nullable=False),
        sa.Column('source', sa.String(50), nullable=True),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_faculty_name_variants_faculty_id', 'faculty_name_variants', ['faculty_id'])
    op.create_index('ix_faculty_name_variants_normalized', 'faculty_name_variants', ['normalized_variant'])

    # 5. affiliation_variants
    op.create_table(
        'affiliation_variants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('canonical_name', sa.String(500), nullable=False),
        sa.Column('variant_text', sa.String(500), nullable=False),
        sa.Column('variant_normalized', sa.String(500), nullable=False, unique=True),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('is_confirmed', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_affiliation_variants_variant_normalized', 'affiliation_variants', ['variant_normalized'])

    # 6. sync_runs
    op.create_table(
        'sync_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('run_type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='running'),
        sa.Column('trigger', sa.String(50), nullable=True),
        sa.Column('triggered_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('publications_discovered', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('publications_merged', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('publications_verified', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('review_tasks_created', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('errors_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 7. agent_runs
    op.create_table(
        'agent_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('sync_run_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sync_runs.id', ondelete='CASCADE'), nullable=True),
        sa.Column('agent_name', sa.String(100), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='running'),
        sa.Column('input_count', sa.Integer(), nullable=True),
        sa.Column('output_count', sa.Integer(), nullable=True),
        sa.Column('error_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('config', postgresql.JSONB(), nullable=True),
        sa.Column('errors', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_agent_runs_sync_run_id', 'agent_runs', ['sync_run_id'])
    op.create_index('ix_agent_runs_agent_name', 'agent_runs', ['agent_name'])

    # 8. publications
    op.create_table(
        'publications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('normalized_title', sa.Text(), nullable=False),
        sa.Column('doi', sa.String(255), nullable=True),
        sa.Column('authors_raw', sa.Text(), nullable=True),
        sa.Column('authors_parsed', postgresql.JSONB(), nullable=True),
        sa.Column('publication_date', sa.Date(), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('month', sa.Integer(), nullable=True),
        sa.Column('journal_name', sa.String(500), nullable=True),
        sa.Column('conference_name', sa.String(500), nullable=True),
        sa.Column('publisher', sa.String(255), nullable=True),
        sa.Column('volume', sa.String(50), nullable=True),
        sa.Column('issue', sa.String(50), nullable=True),
        sa.Column('pages', sa.String(50), nullable=True),
        sa.Column('issn', sa.String(20), nullable=True),
        sa.Column('publication_type', sa.String(50), nullable=True),
        sa.Column('abstract', sa.Text(), nullable=True),
        sa.Column('keywords', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('affiliation_text', sa.Text(), nullable=True),
        sa.Column('affiliation_normalized', sa.Text(), nullable=True),
        sa.Column('affiliation_match_confidence', sa.Float(), nullable=True),
        sa.Column('indexing_status', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('quartile', sa.String(10), nullable=True),
        sa.Column('impact_factor', sa.Float(), nullable=True),
        sa.Column('citescore', sa.Float(), nullable=True),
        sa.Column('open_access', sa.Boolean(), nullable=True),
        sa.Column('citation_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('citation_source', sa.String(50), nullable=True),
        sa.Column('verification_status', sa.String(30), nullable=False, server_default='pending'),
        sa.Column('attribution_confidence', sa.Float(), nullable=True),
        sa.Column('metadata_confidence', sa.Float(), nullable=True),
        sa.Column('risk_level', sa.String(10), nullable=False, server_default='none'),
        sa.Column('risk_reasons', postgresql.JSONB(), nullable=True),
        sa.Column('first_seen_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('last_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('source_csv_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_publications_normalized_title', 'publications', ['normalized_title'])
    op.create_index('ix_publications_doi', 'publications', ['doi'])
    op.create_index('ix_publications_year', 'publications', ['year'])
    op.create_index('ix_publications_verification_status', 'publications', ['verification_status'])
    op.create_index('ix_publications_risk_level', 'publications', ['risk_level'])

    # 9. publication_authors
    op.create_table(
        'publication_authors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('publication_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('publications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('faculty_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('faculty_profiles.id'), nullable=True),
        sa.Column('author_position', sa.Integer(), nullable=True),
        sa.Column('author_name_raw', sa.String(255), nullable=True),
        sa.Column('attribution_confidence', sa.Float(), nullable=True),
        sa.Column('attribution_method', sa.String(100), nullable=True),
        sa.Column('is_corresponding', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_publication_authors_pub_id', 'publication_authors', ['publication_id'])
    op.create_index('ix_publication_authors_faculty_id', 'publication_authors', ['faculty_id'])

    # 10. publication_sources
    op.create_table(
        'publication_sources',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('publication_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('publications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('source_system', sa.String(50), nullable=False),
        sa.Column('source_id', sa.String(255), nullable=True),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('raw_metadata', postgresql.JSONB(), nullable=True),
        sa.Column('discovered_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('discovery_method', sa.String(100), nullable=True),
        sa.Column('sync_run_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sync_runs.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_publication_sources_pub_id', 'publication_sources', ['publication_id'])

    # 11. citation_snapshots
    op.create_table(
        'citation_snapshots',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('publication_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('publications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('citation_count', sa.Integer(), nullable=False),
        sa.Column('source', sa.String(50), nullable=False),
        sa.Column('snapshot_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_citation_snapshots_pub_id', 'citation_snapshots', ['publication_id'])
    op.create_index('ix_citation_snapshots_snapshot_date', 'citation_snapshots', ['snapshot_date'])

    # 12. faculty_metric_snapshots
    op.create_table(
        'faculty_metric_snapshots',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('faculty_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('faculty_profiles.id'), nullable=False),
        sa.Column('h_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('i10_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_citations', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_publications', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('verified_publications', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('snapshot_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_faculty_metric_snapshots_faculty_id', 'faculty_metric_snapshots', ['faculty_id'])
    op.create_index('ix_faculty_metric_snapshots_snapshot_date', 'faculty_metric_snapshots', ['snapshot_date'])

    # 13. review_tasks
    op.create_table(
        'review_tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_type', sa.String(50), nullable=False),
        sa.Column('priority', sa.String(10), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('related_entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('evidence', postgresql.JSONB(), nullable=True),
        sa.Column('options', postgresql.JSONB(), nullable=True),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('assigned_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('decision', sa.String(50), nullable=True),
        sa.Column('decision_detail', postgresql.JSONB(), nullable=True),
        sa.Column('decided_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('decided_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('agent_name', sa.String(100), nullable=True),
        sa.Column('sync_run_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sync_runs.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_review_tasks_status', 'review_tasks', ['status'])
    op.create_index('ix_review_tasks_assigned_to', 'review_tasks', ['assigned_to'])

    # 14. provenance_records
    op.create_table(
        'provenance_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('detail', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('agent_name', sa.String(100), nullable=True),
        sa.Column('sync_run_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_provenance_records_entity_type', 'provenance_records', ['entity_type'])
    op.create_index('ix_provenance_records_entity_id', 'provenance_records', ['entity_id'])
    op.create_index('ix_provenance_records_created_at', 'provenance_records', ['created_at'])

    # 15. audit_log
    op.create_table(
        'audit_log',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('old_value', postgresql.JSONB(), nullable=True),
        sa.Column('new_value', postgresql.JSONB(), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_audit_log_user_id', 'audit_log', ['user_id'])
    op.create_index('ix_audit_log_created_at', 'audit_log', ['created_at'])


def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('provenance_records')
    op.drop_table('review_tasks')
    op.drop_table('faculty_metric_snapshots')
    op.drop_table('citation_snapshots')
    op.drop_table('publication_sources')
    op.drop_table('publication_authors')
    op.drop_table('publications')
    op.drop_table('agent_runs')
    op.drop_table('sync_runs')
    op.drop_table('affiliation_variants')
    op.drop_table('faculty_name_variants')
    op.drop_table('faculty_identifiers')
    op.drop_table('users')
    op.drop_table('faculty_profiles')

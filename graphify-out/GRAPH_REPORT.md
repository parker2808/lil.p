# Graph Report - lil.p  (2026-10-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 5224 nodes · 17059 edges · 209 communities (189 shown, 20 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 429 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89e002a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 173
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184
- Community 185
- Community 186
- Community 187
- Community 188
- Community 189
- Community 190
- Community 191
- Community 192
- Community 193
- Community 194
- Community 195
- Community 196
- Community 197
- Community 198
- Community 199
- Community 200
- Community 201
- Community 203
- Community 204
- Community 205

## God Nodes (most connected - your core abstractions)
1. `cn()` - 239 edges
2. `@nestjs/common` - 159 edges
3. `Button()` - 126 edges
4. `Locale` - 123 edges
5. `next-intl` - 110 edges
6. `apiClient()` - 87 edges
7. `PrismaService` - 80 edges
8. `Badge()` - 71 edges
9. `next` - 68 edges
10. `Input()` - 64 edges

## Surprising Connections (you probably didn't know these)
- `LocaleError()` --calls--> `Button()`  [EXTRACTED]
  apps/web/app/[locale]/error.tsx → packages/ui/src/components/ui/button.tsx
- `hastToReact()` --indirect_call--> `CodeBlock()`  [INFERRED]
  apps/web/src/modules/content/utils/hast-to-react.util.ts → packages/ui/src/components/CodeBlock/CodeBlock.tsx
- `ExperienceForm()` --calls--> `Badge()`  [EXTRACTED]
  apps/web/src/modules/admin-about/components/ExperienceForm/ExperienceForm.tsx → packages/ui/src/components/ui/badge.tsx
- `LoginForm()` --calls--> `Button()`  [EXTRACTED]
  apps/web/src/modules/admin-auth/components/LoginForm/LoginForm.tsx → packages/ui/src/components/ui/button.tsx
- `ArrayWidget()` --calls--> `Button()`  [EXTRACTED]
  apps/web/src/modules/admin-core/components/SchemaForm/widgets/ArrayWidget.tsx → packages/ui/src/components/ui/button.tsx

## Import Cycles
- None detected.

## Communities (209 total, 20 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (54): Public(), JwtAuthGuard, isSameOrigin(), MUTATING, OriginGuard, LoggingInterceptor, RequestWithId, RequestIdMiddleware (+46 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (61): ExperienceForm(), LoginForm(), MarkdownField(), firstIssueMessage(), SchemaFieldControl(), ArrayWidget(), asList(), LocalizedWidget() (+53 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (33): contactTopicsData, navItemsData, profileData, siteSettingsData, socialLinksData, adminEmail, UsersService, PrismaService (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (23): slugify(), AdminAuditController, AuditModule, AuditClient, AuditRecordInput, AuditService, DomainRow, domainSelect (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.03
Nodes (84): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/modifiers@^9.0.0, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2 (+76 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (45): EnViKey, hasText(), pickGroup(), row, toAdminMedia(), toPublicImage(), DeliveryUrls, NavItemRow (+37 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (52): BlockDefinition, BlockRef, BlockRole, defineBlock(), aboutIntroBlock, aboutIntroPropsSchema, caseGridBlock, caseGridPropsSchema (+44 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (58): adminAuditListPageSchema, adminAuditListParamsSchema, adminAuditLogSchema, auditActionSchema, auditEntityTypeSchema, bulkStatusActionSchema, bulkStatusSchema, AuditAction (+50 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (40): PageWithAllBlocks, pageWithAllBlocksInclude, PageWithBlocks, pageWithBlocksInclude, hasUnpublishedChanges(), toAdminPageListItem(), toPublicPage(), asNullableString() (+32 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (36): LocaleError(), EditorShell(), labels, AccentHeadline(), Atmosphere(), LAYOUT_CLASS, CtaBand(), Default (+28 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (43): ExperienceTable(), item, labels, RoleGate(), adminTableLabels(), inspectorFieldErrors(), PagePreview(), PublishBar() (+35 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (45): usePathname, AdminLiveEvents(), AdminShell(), AdminMobileNav(), AdminSidebar(), Topbar(), ADMIN_NAV, AdminNavGroup (+37 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (38): AdminMediaPage(), dynamic, SiteError(), ChangePasswordDialog(), AdminCommandPalette(), normalizeSearch(), MediaPickerDialog(), flattenMediaPages() (+30 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (53): dependencies, cloudinary@^2.11.0, dotenv@^18.0.9, multer@^2.5.0, @nestjs/common@^11.1.9, @nestjs/event-emitter@^12.0.1, @nestjs/jwt@^12.0.3, @nestjs/passport@^12.0.0 (+45 more)

### Community 14 - "Community 14"
Cohesion: 0.09
Nodes (32): useRouter, MarkdownEditor, publicMediaSrc(), hastToReact(), heading(), NotesSearch(), Callout(), CalloutView() (+24 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (25): AdapterCause, AllExceptionsFilter, RequestWithId, uniqueFieldFromPrisma(), visitorEmail, ContactMessageRow, contactMessageSelect, ContactTopicRow (+17 more)

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (36): dynamic, generateMetadata, generateStaticParams(), Page(), CaseStudyMeta(), OutcomeStats(), PrevNext(), RelatedProjects() (+28 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (30): AdminAnalyticsPage(), firstSearchParam(), AdminExperiencePage(), firstSearchParam(), AdminInboxDetailPage(), AdminInboxPage(), firstSearchParam(), AdminHomePage() (+22 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (34): AdminProjectEditorPage(), AdminNewProjectPage(), AdminSitePage(), PublishActions(), useDirtyGuard(), editorLabelsFromMessages(), BlockInspector(), clampLines() (+26 more)

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (27): dynamic, GET(), dynamic, robots(), dynamic, sitemap(), getSitemap(), buildAlternates() (+19 more)

### Community 20 - "Community 20"
Cohesion: 0.05
Nodes (46): @portfolio/contracts@workspace:*, @portfolio/contracts, dependencies, github-slugger@^2.0.0, hast-util-to-jsx-runtime@^2.3.6, lucide-react@^0.553.0, next@16.4.3, next-intl@^4.14.9 (+38 more)

### Community 21 - "Community 21"
Cohesion: 0.09
Nodes (22): AdminUsersController, toAdminUser(), useAdminUsers(), useUserMutations(), createAdminUser(), listAdminUsers(), queryString(), setAdminUserPassword() (+14 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (7): AdminSkillCategoriesController, AdminSkillsController, toAdminCategory(), toAdminSkill(), SkillsService, AdminSkill, AdminSkillCategory

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (32): hueSchema, adminDomainSchema, domainCreateSchema, domainUpdateSchema, publicDomainSchema, publicProjectDomainSchema, DomainCreateInput, DomainUpdateInput (+24 more)

### Community 24 - "Community 24"
Cohesion: 0.08
Nodes (18): argon2@^0.45.1, AuthModule, AuthService, IssuedTokens, adminEmail, missingEmail, verifyPassword(), JwtRefreshStrategy (+10 more)

### Community 25 - "Community 25"
Cohesion: 0.06
Nodes (43): @types/node@^22.19.1, @types/node, allowedStrings, devDependencies, @axe-core/playwright@^4.14.0, chrome-launcher@^1.2.2, eslint-config-next@16.4.3, jsdom@^27.2.0 (+35 more)

### Community 26 - "Community 26"
Cohesion: 0.07
Nodes (30): main(), educationData, experienceData, principleData, processStepData, profileStatData, seedAbout(), seedAdmin() (+22 more)

### Community 27 - "Community 27"
Cohesion: 0.07
Nodes (29): dataDir, esbuild, outDir, require, root, monorepoRoot, nextConfig, withNextIntl (+21 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (26): AdminDomainsPage(), AdminEducationPage(), AdminPrinciplesPage(), AdminProcessPage(), AdminSkillsPage(), AdminStatsPage(), AdminTagsPage(), AdminEducationIndex() (+18 more)

### Community 29 - "Community 29"
Cohesion: 0.20
Nodes (25): listPrinciples(), listMarqueeSkills(), listSkillsGrouped(), BlockHeading(), CaseGridBlock(), CvDownloadBlock(), DomainGridBlock(), EducationListBlock() (+17 more)

### Community 30 - "Community 30"
Cohesion: 0.08
Nodes (24): AdminDashboardController, lintFieldNames(), missingViFieldNames(), POST_LOCALE_FIELDS, PROJECT_LOCALE_FIELDS, splitFactLines(), statsRangeDays(), statsRangeWindow() (+16 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (27): category, skillChipFixtures, skillFixtures, skillsGroupedFixture, SkillDepth, skillDepthSchema, adminSkillCategorySchema, adminSkillSchema (+19 more)

### Community 32 - "Community 32"
Cohesion: 0.10
Nodes (29): dynamic, generateMetadata, Page(), dynamic, generateMetadata, Page(), AboutIndex(), BLOCK_RENDERERS (+21 more)

### Community 33 - "Community 33"
Cohesion: 0.09
Nodes (17): NotSeededException, AdminProfileController, ProfileRow, profileSelect, row, toAdminDto(), toPublicProfile(), TRANSLATED (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.10
Nodes (24): paginate(), PostRow, postSelect, postTagSelect, toAdminListItem(), published, projectDomainSelect, projectExperienceSelect (+16 more)

### Community 35 - "Community 35"
Cohesion: 0.09
Nodes (23): publicScreens, globalSetup(), createReviewer(), signIn(), signOut(), expectNoSeriousAxeIssues(), E2E_ADMIN, E2E_USER (+15 more)

### Community 36 - "Community 36"
Cohesion: 0.06
Nodes (27): NotificationBell(), admin, renderBell(), user, admin, user, admin, FakeEventSource (+19 more)

### Community 37 - "Community 37"
Cohesion: 0.05
Nodes (36): compilerOptions, declaration, emitDecoratorMetadata, experimentalDecorators, module, moduleResolution, noEmit, outDir (+28 more)

### Community 38 - "Community 38"
Cohesion: 0.08
Nodes (31): isAllowedImageSrc(), isAllowedMarkdownUrl(), MARKDOWN_CODE_LANGUAGES, @tiptap/core@3.32.0, @tiptap/pm@3.32.0, @tiptap/suggestion@3.32.0, insertImage(), apply() (+23 more)

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (29): dataFile(), LocalizedPair, LocalizedProp, mapContactTopics(), mapDomains(), mapEducation(), mapExperience(), mapNavItems() (+21 more)

### Community 40 - "Community 40"
Cohesion: 0.08
Nodes (29): postFixture, postFixtures, viPostFixture, adminPostInputSchema, adminPostListItemSchema, adminPostListPageSchema, adminPostListParamsSchema, adminPostListTagSchema (+21 more)

### Community 41 - "Community 41"
Cohesion: 0.09
Nodes (25): POST(), dynamic, generateMetadata, Page(), dynamic, generateMetadata, Page(), dynamic (+17 more)

### Community 42 - "Community 42"
Cohesion: 0.12
Nodes (28): QuerySnapshot, restoreQueries(), snapshotQueries(), useAdminPages(), page, reorder, useBlockMutations(), useDiscardPage() (+20 more)

### Community 43 - "Community 43"
Cohesion: 0.10
Nodes (22): InboxTable(), STATUS_VARIANT, item, labels, formatRelative(), PostsTable(), STATUS_KEY, formatRelative() (+14 more)

### Community 44 - "Community 44"
Cohesion: 0.07
Nodes (35): depends_on, environment, image, ports, command, condition, environment, healthcheck (+27 more)

### Community 45 - "Community 45"
Cohesion: 0.10
Nodes (18): toIsoDate(), applyReorder(), assertSameIds(), reorder(), ReorderDelegate, Transactional, assertFresh(), EducationRow (+10 more)

### Community 46 - "Community 46"
Cohesion: 0.15
Nodes (7): AdminPostsController, toAdminDto(), PostsService, BulkStatusInput, AdminPost, PostCreateInput, PostUpdateInput

### Community 47 - "Community 47"
Cohesion: 0.15
Nodes (18): toAdminBlock(), assertAllowedOnPage(), assertCanDelete(), assertCanHide(), assertInsertKeepsH1First(), assertLayoutAllowed(), assertWithinLimit(), definitionOf() (+10 more)

### Community 48 - "Community 48"
Cohesion: 0.06
Nodes (34): react-dom@19.3.0, react-dom, devDependencies, @fontsource/be-vietnam-pro@^5.2.8, @fontsource/jetbrains-mono@^5.2.8, @fontsource-variable/inter@^5.2.8, jsdom@^27.4.0, react@19.3.0 (+26 more)

### Community 49 - "Community 49"
Cohesion: 0.10
Nodes (12): CurrentUser, JwtRefreshGuard, AuthedRequest, RequestUser, toMeDto(), roleSchema, changePasswordSchema, loginSchema (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.13
Nodes (13): ContactThrottleGuard, LoginThrottleGuard, RateLimitGuard, ViewsThrottleGuard, hashIp(), requestIp(), utcDayKey(), deviceFromUa() (+5 more)

### Community 51 - "Community 51"
Cohesion: 0.12
Nodes (7): AdminExperienceController, toAdminDto(), ExperienceService, AdminExperience, AdminExperienceListPage, AdminExperienceListParams, ExperienceCreateInput

### Community 52 - "Community 52"
Cohesion: 0.12
Nodes (21): BlockRow(), BLOCK_EDITOR_META, renderToggle(), setTheme, ThemeToggle(), BlockType, FilterBar(), FilterChip (+13 more)

### Community 53 - "Community 53"
Cohesion: 0.14
Nodes (18): AboutIntroBlock(), ContactFormBlock(), Cta, HeroBlock(), PageHeaderBlock(), initials(), Markdown(), HeroStage() (+10 more)

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (5): withAuditTx(), AdminProjectsController, toAdminDto(), ProjectsService, AdminProject

### Community 55 - "Community 55"
Cohesion: 0.08
Nodes (8): AdminMediaController, MediaService, PublicMediaController, UpdateMediaInput, CONTENT_ROOTS, DENYLIST, failures, files

### Community 56 - "Community 56"
Cohesion: 0.10
Nodes (18): StatSource, statSourceSchema, adminProfileStatSchema, profileStatCreateSchema, profileStatUpdateSchema, publicProfileStatSchema, ProfileStatUpdateInput, publicSitemapEntrySchema (+10 more)

### Community 57 - "Community 57"
Cohesion: 0.12
Nodes (19): AdminCmsLayout(), AdminProfilePage(), AutosaveStatus, useAutosave(), useAdminProfile(), useSaveAdminProfile(), getAdminProfile(), updateAdminProfile() (+11 more)

### Community 58 - "Community 58"
Cohesion: 0.21
Nodes (7): Roles(), flattenZodError(), ZodValidationPipe, ReorderInput, reorderSchema, AdminMediaListPage, AdminMediaListParams

### Community 59 - "Community 59"
Cohesion: 0.11
Nodes (18): localeQuerySchema, localeSchema, Entity, ListParams, adminContactTopicSchema, contactTopicCreateSchema, contactTopicUpdateSchema, publicContactTopicSchema (+10 more)

### Community 60 - "Community 60"
Cohesion: 0.14
Nodes (5): AdminEducationController, EducationService, toAdminDto(), AdminEducation, EducationCreateInput

### Community 61 - "Community 61"
Cohesion: 0.14
Nodes (5): AdminPrinciplesController, toAdminDto(), PrinciplesService, AdminPrinciple, PrincipleCreateInput

### Community 62 - "Community 62"
Cohesion: 0.14
Nodes (5): AdminProfileStatsController, toAdminDto(), ProfileStatsService, AdminProfileStat, ProfileStatCreateInput

### Community 63 - "Community 63"
Cohesion: 0.24
Nodes (18): AddBlockDialog(), TagPicker(), TechFilter(), Icon(), ICONS, IconPicker(), SlashMenu, ProcessFlow() (+10 more)

### Community 64 - "Community 64"
Cohesion: 0.12
Nodes (27): buildUnmappedNote(), loadPortfolioData(), overlayPageSectionTitles(), apiRoot, assertCommittedMigrationMatches(), buildContentMigration(), ContentCounts, here (+19 more)

### Community 65 - "Community 65"
Cohesion: 0.14
Nodes (5): AdminContactTopicsController, ContactTopicsService, toAdminDto(), AdminContactTopic, ContactTopicCreateInput

### Community 66 - "Community 66"
Cohesion: 0.11
Nodes (10): DetectedMedia, detectMediaKind(), MEDIA_MAX_BYTES, MediaModule, CloudinaryMediaStorage, createMediaStorage(), MEDIA_STORAGE, MediaStorage (+2 more)

### Community 67 - "Community 67"
Cohesion: 0.15
Nodes (5): AdminProcessStepsController, toAdminDto(), ProcessStepsService, AdminProcessStep, ProcessStepCreateInput

### Community 68 - "Community 68"
Cohesion: 0.15
Nodes (17): renderAppLink(), RoutePending(), CaseCard(), CoverPlaceholder(), Amber, Blue, meta, Story (+9 more)

### Community 69 - "Community 69"
Cohesion: 0.13
Nodes (9): AdminContactController, ContactService, parseLocale(), toAdminContactMessage(), AdminContactMessage, AdminContactMessageListPage, AdminContactMessageListParams, UnreadCount (+1 more)

### Community 70 - "Community 70"
Cohesion: 0.16
Nodes (4): AdminDomainsController, DomainsService, toAdminDto(), AdminDomain

### Community 71 - "Community 71"
Cohesion: 0.15
Nodes (6): AdminTagsController, toAdminDto(), TagsService, AdminTag, TagCreateInput, TagUpdateInput

### Community 72 - "Community 72"
Cohesion: 0.11
Nodes (17): AdminAuditPage(), flattenAuditPages(), useAdminAuditInfinite(), AdminInsightsAudit(), AuditVirtualList(), clientHeightDesc, clientWidthDesc, AdminAuditLog (+9 more)

### Community 73 - "Community 73"
Cohesion: 0.19
Nodes (17): NotesBrowserBlock(), NotesBrowser(), formatDate(), PostList(), TagFilter(), firstSearchParam(), groupPostsByYear(), notesHref() (+9 more)

### Community 74 - "Community 74"
Cohesion: 0.11
Nodes (24): adminViewsSchema, topPageSchema, topReferrerSchema, trackViewSchema, viewDeviceSchema, viewsByDaySchema, TopPage, TopReferrer (+16 more)

### Community 75 - "Community 75"
Cohesion: 0.12
Nodes (21): imageLoader(), nearestVariantWidth(), WIDTHS, adminMediaListPageSchema, adminMediaListParamsSchema, adminMediaSchema, adminProjectImageInputSchema, adminProjectImageSchema (+13 more)

### Community 76 - "Community 76"
Cohesion: 0.13
Nodes (16): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+8 more)

### Community 77 - "Community 77"
Cohesion: 0.16
Nodes (4): AdminNavigationController, toAdminDto(), NavigationService, AdminNavItem

### Community 78 - "Community 78"
Cohesion: 0.18
Nodes (4): AdminPagesController, toAdminPage(), AdminPage, AdminPageListItem

### Community 79 - "Community 79"
Cohesion: 0.16
Nodes (17): AdminExperienceEditorPage(), AdminNewExperiencePage(), useAdminExperienceRow(), useCreateAdminExperience(), useSaveAdminExperience(), createAdminExperience(), emptyExperienceForm(), ExperienceFormValues (+9 more)

### Community 80 - "Community 80"
Cohesion: 0.14
Nodes (15): AdminRootLayout(), dynamic, metadata, LocaleLayout(), metadata, routing, APP_TIME_ZONE, ApiWarmup() (+7 more)

### Community 81 - "Community 81"
Cohesion: 0.17
Nodes (17): StatsCards(), StatsCardsView(), useAdminHealth(), useAdminStats(), fetchAdminHealth(), fetchAdminStats(), formatCount(), rangeHref() (+9 more)

### Community 82 - "Community 82"
Cohesion: 0.15
Nodes (21): useAdminPost(), useCreateAdminPost(), usePublishAdminPost(), useSaveAdminPost(), useUnpublishAdminPost(), item, page, params (+13 more)

### Community 83 - "Community 83"
Cohesion: 0.11
Nodes (19): cookie-parser@^1.4.7, @nestjs/core@^11.1.9, @nestjs/swagger@^11.4.7, reflect-metadata@^0.2.2, IS_PUBLIC_KEY, ROLES_KEY, RolesGuard, context() (+11 more)

### Community 85 - "Community 85"
Cohesion: 0.14
Nodes (16): dynamic, SiteLayout(), getPathname, Link, redirect, DraftBanner(), DraftBannerView(), isDismissed() (+8 more)

### Community 86 - "Community 86"
Cohesion: 0.19
Nodes (20): usePublishAdminProject(), useUnpublishAdminProject(), item, page, params, useAdminProjects(), useArchiveAdminProject(), useMoveAdminProject() (+12 more)

### Community 87 - "Community 87"
Cohesion: 0.08
Nodes (26): scripts, build, check:content, check:deps, check:placeholders, db:down, db:logs, db:migrate (+18 more)

### Community 88 - "Community 88"
Cohesion: 0.18
Nodes (4): AdminSocialLinksController, toAdminDto(), SocialLinksService, AdminSocialLink

### Community 89 - "Community 89"
Cohesion: 0.20
Nodes (17): ActivityCardView(), item, ContentHealthCard(), ContentHealthCardView(), issueDetail(), issueKey(), issueTitle(), InboxCardView() (+9 more)

### Community 90 - "Community 90"
Cohesion: 0.16
Nodes (20): unist-util-visit@^5.2.0, previewMarkdown(), SHIKI_THEME_NAME, shikiCssTheme, ALLOWED_LANGS, classNameOf(), filenameOf(), getHighlighter() (+12 more)

### Community 91 - "Community 91"
Cohesion: 0.15
Nodes (22): AboutIntroSkeleton(), CaseGridSkeleton(), ContactFormSkeleton(), CtaBandSkeleton(), CvDownloadSkeleton(), DomainGridSkeleton(), EducationListSkeleton(), FeaturedCaseSkeleton() (+14 more)

### Community 92 - "Community 92"
Cohesion: 0.10
Nodes (21): typescript@^5.9.3, typescript@^5.9.3, typescript@^5.9.3, typescript, dependencies, zod@^4.1.12, devDependencies, tsup@^8.5.0 (+13 more)

### Community 93 - "Community 93"
Cohesion: 0.12
Nodes (13): educationApi, principlesApi, processStepsApi, profileStatsApi, AdminEntityApi, createAdminEntityApi(), contactTopicsApi, navigationApi (+5 more)

### Community 94 - "Community 94"
Cohesion: 0.13
Nodes (14): login(), useAdminSite(), useSaveAdminSite(), getAdminSite(), updateAdminSite(), AUTH_PATHS, needsAuthRefresh(), parseBody() (+6 more)

### Community 95 - "Community 95"
Cohesion: 0.12
Nodes (9): items, renderForm(), submit, LABELS, labels, clientHeightDesc, clientWidthDesc, labels (+1 more)

### Community 96 - "Community 96"
Cohesion: 0.10
Nodes (9): ResizeObserverStub, ResizeObserverStub, StatBand(), StatItem(), Compact, Default, meta, Story (+1 more)

### Community 97 - "Community 97"
Cohesion: 0.15
Nodes (9): AuthController, ACCESS_COOKIE, ACCESS_COOKIE_PATH, authCookieFlags(), clearAuthCookies(), cookieOptions(), REFRESH_COOKIE, REFRESH_COOKIE_PATH (+1 more)

### Community 98 - "Community 98"
Cohesion: 0.14
Nodes (14): BlockList(), applySortableReorder(), SortableItem, SortableList(), onDragEnd(), SortableListLabels, SortableRow(), Demo() (+6 more)

### Community 99 - "Community 99"
Cohesion: 0.13
Nodes (14): labels, renderMarkdown(), labels, MarkdownLabels, markdownKitchenSink, markdownUnsafe, editorLabels, Compact (+6 more)

### Community 100 - "Community 100"
Cohesion: 0.10
Nodes (22): environment, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ANALYTICS_SALT_SECRET, API_HOST, API_PORT, API_URL (+14 more)

### Community 101 - "Community 101"
Cohesion: 0.14
Nodes (6): rxjs@^7.8.2, AdminEventsController, EventsModule, ContactCreatedEvent, EventsService, rxjs

### Community 102 - "Community 102"
Cohesion: 0.16
Nodes (12): ICON_KEYS, iconKeySchema, adminPrincipleSchema, principleCreateSchema, principleUpdateSchema, publicPrincipleSchema, PrincipleUpdateInput, adminProcessStepSchema (+4 more)

### Community 103 - "Community 103"
Cohesion: 0.16
Nodes (16): contentType, dynamic, Image(), size, contentType, dynamic, Image(), size (+8 more)

### Community 104 - "Community 104"
Cohesion: 0.10
Nodes (20): eslint@^9.39.1, @commitlint/config-conventional@^21.2.4, eslint@^10.13.0, husky@^9.1.7, prettier-plugin-tailwindcss@^0.8.1, engines, node, eslint (+12 more)

### Community 105 - "Community 105"
Cohesion: 0.18
Nodes (13): MarkdownSection, splitMarkdownSections(), CaseStudySections(), caseStudyToc(), SectionSpec, projectNeighbors(), splitDecisions(), splitLimitsAndScope() (+5 more)

### Community 106 - "Community 106"
Cohesion: 0.19
Nodes (15): ExperienceGroup, groupExperience(), highlightItems(), groupYears(), monthLabel(), Default, meta, Story (+7 more)

### Community 107 - "Community 107"
Cohesion: 0.15
Nodes (8): AdminSiteController, Availability, availabilitySchema, adminSiteSettingsSchema, publicSiteSettingsSchema, siteSettingsUpdateSchema, AdminSiteSettings, SiteSettingsUpdateInput

### Community 108 - "Community 108"
Cohesion: 0.12
Nodes (13): AdminPostEditorPage(), AdminNewPostPage(), AdminPostsEditor(), admin, create, createTag, draft, getPost (+5 more)

### Community 109 - "Community 109"
Cohesion: 0.23
Nodes (15): item, page, params, useAdminExperience(), useMoveAdminExperience(), usePrefetchAdminExperience(), useRemoveAdminExperience(), useToggleExperienceVisible() (+7 more)

### Community 110 - "Community 110"
Cohesion: 0.10
Nodes (15): Default, meta, Story, meta, States, Story, All, LABELS (+7 more)

### Community 111 - "Community 111"
Cohesion: 0.11
Nodes (18): if, runs-on, steps, BASE, HEAD, jobs, context, name (+10 more)

### Community 112 - "Community 112"
Cohesion: 0.24
Nodes (11): AdminLoginPage(), dynamic, ADMIN_LOGIN_AUTO_REDIRECT_KEY, clientHasAdminSession(), hasAdminLoginAutoRedirected(), markAdminLoginAutoRedirected(), { refreshOnce }, safeAdminNext() (+3 more)

### Community 113 - "Community 113"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 114 - "Community 114"
Cohesion: 0.21
Nodes (13): replace, useListParams(), useAdminMessage(), useAdminMessages(), useInboxMutations(), getAdminMessage(), listAdminMessages(), queryString() (+5 more)

### Community 115 - "Community 115"
Cohesion: 0.14
Nodes (13): labels, confidentialProjectFixture, overflowProjectFixture, projectFixture, projectFixtures, skills, PublicProjectListItem, Default (+5 more)

### Community 116 - "Community 116"
Cohesion: 0.14
Nodes (17): devDependencies, @commitlint/cli@^21.2.4, eslint-config-prettier@^10.1.8, @eslint/js@^10.0.1, eslint-plugin-react@^7.37.5, eslint-plugin-simple-import-sort@^14.0.0, lint-staged@^17.6.0, prettier@^3.9.10 (+9 more)

### Community 117 - "Community 117"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 118 - "Community 118"
Cohesion: 0.18
Nodes (12): collectHits(), findMarkers(), formatHits(), LIVE_PUBLIC, loadMariadb(), MARKERS, parseMysqlUrl(), queryAll() (+4 more)

### Community 119 - "Community 119"
Cohesion: 0.19
Nodes (10): EmploymentType, employmentTypeSchema, adminExperienceListPageSchema, adminExperienceListParamsSchema, adminExperienceSchema, experienceCreateSchema, experienceUpdateSchema, publicExperienceSchema (+2 more)

### Community 120 - "Community 120"
Cohesion: 0.17
Nodes (11): PublicRoute, publicRouteSchema, NavLocation, navLocationSchema, adminNavItemSchema, navHrefSchema, navItemCreateSchema, navItemUpdateSchema (+3 more)

### Community 121 - "Community 121"
Cohesion: 0.12
Nodes (16): scripts, build, content:migration, db:migrate, db:reset, db:seed, db:studio, dev (+8 more)

### Community 122 - "Community 122"
Cohesion: 0.23
Nodes (10): toAdminAuditLog(), useAdminAudit(), useBulkArchivePosts(), useBulkArchiveProjects(), bulkAdminPosts(), bulkAdminProjects(), listAdminAudit(), queryString() (+2 more)

### Community 123 - "Community 123"
Cohesion: 0.19
Nodes (10): SchemaForm(), renderForm(), isLocalized(), JsonSchema, kindFor(), SchemaFieldKind, schemaToFields(), unwrap() (+2 more)

### Community 124 - "Community 124"
Cohesion: 0.26
Nodes (11): ContactCreated, useAdminEvents(), close(), open(), flattenIssues(), postContact(), submitContactClient(), PageViewBeacon() (+3 more)

### Community 125 - "Community 125"
Cohesion: 0.16
Nodes (11): principleFixtures, FeatureCard(), Default, Grid, meta, Story, PrincipleList(), principleNumber() (+3 more)

### Community 126 - "Community 126"
Cohesion: 0.13
Nodes (10): BoundaryProps, SectionBoundaryLabels, SectionErrorCatcher, Empty, Failed, LABELS, Loading, meta (+2 more)

### Community 127 - "Community 127"
Cohesion: 0.24
Nodes (12): dynamic, generateMetadata, generateStaticParams(), Page(), getPost(), getPostOrNull(), listPosts(), listPostsPage() (+4 more)

### Community 128 - "Community 128"
Cohesion: 0.25
Nodes (11): adminContactMessageListPageSchema, adminContactMessageListParamsSchema, adminContactMessageSchema, adminContactMessageTopicSchema, CONTACT_MESSAGE_MAX, contactMessageStatusSchema, contactSchema, contactSubmitResultSchema (+3 more)

### Community 129 - "Community 129"
Cohesion: 0.20
Nodes (7): ContentProgress(), Default, meta, Story, MigrationDiagram(), SKILL_SLOTS, usePrefersReducedMotion()

### Community 130 - "Community 130"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+6 more)

### Community 131 - "Community 131"
Cohesion: 0.16
Nodes (8): @nestjs/config@^4.0.2, ConfigModule, envSchema, optionalSecret, optionalText, optionalUrl, valid, @nestjs/config

### Community 132 - "Community 132"
Cohesion: 0.22
Nodes (9): BlockRenderer(), renderEntry(), context, labels, UnknownBlockNotice(), BlockRenderers, InvalidPreviewBlock, Band() (+1 more)

### Community 133 - "Community 133"
Cohesion: 0.26
Nodes (9): CaseStudyToc(), SectionNav(), Default, meta, Story, TocItem, Collapsible(), CollapsibleContent() (+1 more)

### Community 134 - "Community 134"
Cohesion: 0.15
Nodes (9): ColorBook, ColorModes, colorsPath, cssPath, here, hexToRgba(), parseColor(), Rgba (+1 more)

### Community 135 - "Community 135"
Cohesion: 0.23
Nodes (11): ActivityCard(), InboxCard(), AdminDashboardIndex(), HealthSkeleton(), StatsSkeleton(), admin, fetchHealth, fetchStats (+3 more)

### Community 136 - "Community 136"
Cohesion: 0.29
Nodes (9): ProjectsBrowserBlock(), DomainFilter(), ProjectsView(), go(), listDomains(), getFeaturedProject(), firstSearchParam(), parseProjectsSearch() (+1 more)

### Community 137 - "Community 137"
Cohesion: 0.19
Nodes (8): startHeroShader(), draw(), resume(), startShader(), colors(), frame(), resume(), rgb()

### Community 139 - "Community 139"
Cohesion: 0.15
Nodes (12): key, sync, value, services, dockerContext, dockerfilePath, envVars, healthCheckPath (+4 more)

### Community 141 - "Community 141"
Cohesion: 0.29
Nodes (6): CtaBandBlock(), ChannelCards(), ChannelCardsView(), address, CopyEmailButton(), next-intl

### Community 142 - "Community 142"
Cohesion: 0.33
Nodes (8): RangeToggle(), columns(), LayoutPresetPicker(), STATS_RANGES, HUE_OPTIONS, HUES, ToggleGroup(), ToggleGroupItem()

### Community 143 - "Community 143"
Cohesion: 0.17
Nodes (11): description, name, runs, steps, using, run, shell, uses (+3 more)

### Community 144 - "Community 144"
Cohesion: 0.17
Nodes (9): processStepFixtures, FallbackChain, FewerSkills, Full, meta, Story, Default, meta (+1 more)

### Community 146 - "Community 146"
Cohesion: 0.33
Nodes (8): applySecurityHeaders(), config, handleI18n, proxy(), requestWithNonce(), buildContentSecurityPolicy(), SECURITY_HEADER_NAMES, SECURITY_HEADER_VALUES

### Community 147 - "Community 147"
Cohesion: 0.22
Nodes (7): domainFixture, domainFixtures, emptyDomainFixture, Default, meta, Set, Story

### Community 148 - "Community 148"
Cohesion: 0.22
Nodes (11): environment, environment, BACKUP_DIR, MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_PORT, MYSQL_ROOT_PASSWORD (+3 more)

### Community 149 - "Community 149"
Cohesion: 0.22
Nodes (7): @storybook/react-vite@^10.0.0, ActivityFeed(), labels, meta, WithRows, config, @storybook/react-vite

### Community 150 - "Community 150"
Cohesion: 0.38
Nodes (8): asDay(), asInt(), daysBetween(), emptyViews(), mergeViewsByDay(), utcDateKey(), AdminViews, ViewsByDay

### Community 151 - "Community 151"
Cohesion: 0.20
Nodes (10): depends_on, image, read_only, restart, tmpfs, volumes, depends_on, condition (+2 more)

### Community 152 - "Community 152"
Cohesion: 0.28
Nodes (8): heading(), Localized, pagesData, publishSeedPages(), SeedBlock, SeedPage, seedPages(), t()

### Community 153 - "Community 153"
Cohesion: 0.25
Nodes (4): AuditActorInterceptor, auditActor, AuditActorStore, currentAuditUserId()

### Community 154 - "Community 154"
Cohesion: 0.39
Nodes (7): flattenIssues(), fromFormData(), postContact(), requestOrigin(), submitContact(), submitContactForm(), ContactActionResult

### Community 155 - "Community 155"
Cohesion: 0.22
Nodes (8): name, services, volumes, backups, caddy-config, caddy-data, db-data, uploads

### Community 156 - "Community 156"
Cohesion: 0.22
Nodes (8): concurrency, cancel-in-progress, group, jobs, lint-typecheck-unit, runs-on, timeout-minutes, name

### Community 157 - "Community 157"
Cohesion: 0.31
Nodes (9): env, API_HOST, API_PORT, API_URL, NEXT_PUBLIC_SITE_URL, NODE_ENV, WEB_INTERNAL_URL, WEB_ORIGIN (+1 more)

### Community 158 - "Community 158"
Cohesion: 0.25
Nodes (9): runs-on, services, steps, timeout-minutes, api-e2e, steps, name, run (+1 more)

### Community 159 - "Community 159"
Cohesion: 0.22
Nodes (9): MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD, MYSQL_USER, env, image, options, ports (+1 more)

### Community 160 - "Community 160"
Cohesion: 0.43
Nodes (6): sonner@^2.0.8, useAdminMediaMutations(), listAdminMedia(), removeAdminMedia(), updateAdminMedia(), sonner

### Community 161 - "Community 161"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:e2e, typecheck

### Community 162 - "Community 162"
Cohesion: 0.29
Nodes (8): build, API_URL, NEXT_PUBLIC_BUILD_SHA, NEXT_PUBLIC_SITE_URL, args, context, dockerfile, build

### Community 163 - "Community 163"
Cohesion: 0.25
Nodes (8): condition, api, web, depends_on, image, read_only, restart, tmpfs

### Community 164 - "Community 164"
Cohesion: 0.25
Nodes (8): depends_on, image, ports, read_only, restart, tmpfs, volumes, caddy

### Community 165 - "Community 165"
Cohesion: 0.25
Nodes (8): env, if, with, working-directory, steps, name, path, retention-days

### Community 166 - "Community 166"
Cohesion: 0.25
Nodes (7): Conflict, labels, meta, Offline, Saved, Saving, Story

### Community 167 - "Community 167"
Cohesion: 0.25
Nodes (6): CORE, CORE_BG, Default, meta, PAIR_ROWS, Story

### Community 168 - "Community 168"
Cohesion: 0.25
Nodes (6): Default, meta, RADII, SHADOWS, SPACES, Story

### Community 170 - "Community 170"
Cohesion: 0.48
Nodes (7): healthcheck, healthcheck, interval, retries, start_period, test, timeout

### Community 171 - "Community 171"
Cohesion: 0.29
Nodes (7): entrypoint, image, read_only, restart, tmpfs, volumes, backup

### Community 172 - "Community 172"
Cohesion: 0.29
Nodes (7): command, image, read_only, restart, tmpfs, volumes, db

### Community 173 - "Community 173"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 174 - "Community 174"
Cohesion: 0.47
Nodes (4): SkillCategoryRow, skillCategorySelect, SkillRow, skillSelect

### Community 175 - "Community 175"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, test, typecheck

### Community 176 - "Community 176"
Cohesion: 0.33
Nodes (6): scripts, build-storybook, lint, storybook, test, typecheck

### Community 177 - "Community 177"
Cohesion: 0.33
Nodes (5): Down, Flat, meta, Story, Up

### Community 178 - "Community 178"
Cohesion: 0.33
Nodes (5): Loading, meta, SIZES, Story, VARIANTS

### Community 179 - "Community 179"
Cohesion: 0.33
Nodes (4): Default, EASINGS, meta, Story

### Community 181 - "Community 181"
Cohesion: 0.40
Nodes (3): api, list, reorder

### Community 182 - "Community 182"
Cohesion: 0.40
Nodes (5): on, pull_request, push, workflow_dispatch, branches

### Community 183 - "Community 183"
Cohesion: 0.40
Nodes (4): meta, Plain, Story, WithAccent

### Community 184 - "Community 184"
Cohesion: 0.40
Nodes (4): Disabled, Hero, meta, Story

### Community 185 - "Community 185"
Cohesion: 0.40
Nodes (4): meta, Note, Story, Warning

### Community 186 - "Community 186"
Cohesion: 0.40
Nodes (4): Default, HiddenWhenEmpty, meta, Story

### Community 187 - "Community 187"
Cohesion: 0.40
Nodes (4): Idle, InFlight, meta, Story

### Community 188 - "Community 188"
Cohesion: 0.40
Nodes (4): Compact, Default, meta, Story

### Community 189 - "Community 189"
Cohesion: 0.40
Nodes (4): Animated, meta, Static, Story

### Community 190 - "Community 190"
Cohesion: 0.40
Nodes (4): HUES, meta, Story, VARIANTS

### Community 191 - "Community 191"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 192 - "Community 192"
Cohesion: 0.50
Nodes (4): web-e2e, runs-on, services, timeout-minutes

### Community 193 - "Community 193"
Cohesion: 0.50
Nodes (3): Default, meta, Story

### Community 194 - "Community 194"
Cohesion: 0.50
Nodes (3): Default, meta, Story

## Knowledge Gaps
- **1 isolated node(s):** `./tsconfig.json`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1313 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `Community 0` to `Community 2`, `Community 131`, `Community 3`, `Community 5`, `Community 7`, `Community 8`, `Community 13`, `Community 15`, `Community 21`, `Community 24`, `Community 153`, `Community 30`, `Community 31`, `Community 33`, `Community 34`, `Community 45`, `Community 46`, `Community 47`, `Community 49`, `Community 50`, `Community 58`, `Community 66`, `Community 69`, `Community 71`, `Community 83`, `Community 101`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `./tsconfig.json` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.026140927345746624 - nodes in this community are weakly interconnected._
- **Why does `next-intl` connect `Community 141` to `Community 1`, `Community 135`, `Community 136`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 142`, `Community 16`, `Community 146`, `Community 18`, `Community 20`, `Community 25`, `Community 27`, `Community 28`, `Community 29`, `Community 32`, `Community 160`, `Community 36`, `Community 41`, `Community 42`, `Community 52`, `Community 53`, `Community 57`, `Community 63`, `Community 68`, `Community 72`, `Community 73`, `Community 79`, `Community 80`, `Community 81`, `Community 82`, `Community 85`, `Community 86`, `Community 89`, `Community 95`, `Community 108`, `Community 109`, `Community 112`, `Community 114`, `Community 123`, `Community 124`, `Community 127`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10223367697594501 - nodes in this community are weakly interconnected._
- **Why does `@storybook/react` connect `Community 110` to `Community 129`, `Community 1`, `Community 4`, `Community 133`, `Community 9`, `Community 11`, `Community 12`, `Community 14`, `Community 16`, `Community 144`, `Community 147`, `Community 32`, `Community 166`, `Community 167`, `Community 40`, `Community 168`, `Community 43`, `Community 48`, `Community 177`, `Community 178`, `Community 179`, `Community 53`, `Community 183`, `Community 184`, `Community 185`, `Community 186`, `Community 187`, `Community 188`, `Community 189`, `Community 190`, `Community 193`, `Community 194`, `Community 195`, `Community 68`, `Community 76`, `Community 89`, `Community 96`, `Community 98`, `Community 99`, `Community 105`, `Community 106`, `Community 115`, `Community 125`, `Community 126`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10553814002089865 - nodes in this community are weakly interconnected._
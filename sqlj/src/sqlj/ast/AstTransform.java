package sqlj.ast;

import java.lang.reflect.Method;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.*;

import org.eclipse.jdt.core.compiler.IProblem;
import org.eclipse.jdt.core.dom.*;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.internal.compiler.*;
import org.eclipse.jdt.internal.compiler.env.*;
import org.eclipse.jdt.internal.compiler.problem.DefaultProblemFactory;
import org.eclipse.jface.text.*;
import org.eclipse.text.edits.TextEdit;

import sqlj.core.*;
import sqlj.exception.ParserException;
import sqlj.exception.TransformException;
import sqlj.parser.*;

public class AstTransform {
	public static final String METHOD_GET = "get";
	public static final String METHOD_TO_STRING = "toString";
	public static final String METHOD_APPEND = "append";
	public static final String METHOD_GET_CONNECTION = "getConnection";
	public static final String UPDATE_COUNT = "UPDATE_COUNT";
	public static final String METHOD_PREPARE_CALL = "prepareCall";
	public static final String METHOD_REGISTER_OUT_PARAMETER = "registerOutParameter";
	public static final String METHOD_PREPARE_STATEMENT = "prepareStatement";
	public static final String METHOD_EXECUTE = "execute";
	public static final String METHOD_GET_UPDATE_COUNT = "getUpdateCount";
	public static final String METHOD_GET_RESULT_SET = "getResultSet";
	public static final int API_LEVEL = AST.JLS3;

	private ParsedSource parsedSource;

	private String rs_list_name;
	private String conn_name;
	private String ctx_name;

	public AstTransform(ParsedSource parsedSource) {
		super();
		this.parsedSource = parsedSource;
		rs_list_name = parsedSource.genId("rs_list");
		conn_name = parsedSource.genId("conn");
		ctx_name = parsedSource.genId("ctx");
	}

	public String tranform() throws Exception {
		CompilationUnit result = createCompilationUnit();
		Document doc = new Document(parsedSource.getBuffer().toString());
		TextEdit edits = result.rewrite(doc, null);
		edits.apply(doc);
		String sourceCode = doc.get();
		return sourceCode;
	}

	/**
	 * the final java source will be set into <i>doc<i>
	 * 
	 * @param doc
	 *            the document that contains the parsed original source
	 * @throws Exception
	 */
	public void transform(IDocument doc) throws Exception {
		CompilationUnit result = createCompilationUnit();
		TextEdit edits = result.rewrite(doc, null);
		edits.apply(doc);
	}

	private CompilationUnit createCompilationUnit() throws Exception {
		StringBuilder strBuffer = parsedSource.getBuffer();
		//System.out.println(strBuffer);
		char[] cs = new char[strBuffer.length()];
		strBuffer.getChars(0, cs.length, cs, 0);
		CompilationUnit result = createAST(cs, ASTParser.K_COMPILATION_UNIT);
		long t0 = System.currentTimeMillis();
		if (result.getProblems().length == 0) {
			result.recordModifications();
			List<TypeDeclaration> types = result.types();
			for (TypeDeclaration td : types) {
				if (Modifier.isPublic(td.getModifiers())
						&& !Modifier.isStatic(td.getModifiers())) {
					transform(td);
					break;
				}
			}
		} else {
			//System.out.println(strBuffer);
			for (IProblem p : result.getProblems()) {
				int dx = translateToAbs(p.getSourceStart())
						- p.getSourceStart();
				p.setSourceStart(p.getSourceStart() + dx);
				p.setSourceEnd(p.getSourceEnd() + dx);
			}
			throw new TransformException(result.getProblems());
		}
		System.out.println(System.currentTimeMillis() - t0);
		return result;
	}

	private int translateToAbs(int idx) {
		int size = parsedSource.getSqljBlockSize();
		int trx = 0;
		SqljBlock lastSqljBlock = null;
		for (int i = 0; i < size; i++) {
			SqljBlock b = parsedSource.getSqlById(i);
			if (lastSqljBlock == null) {
				trx = b.getStartIdx();
				if (trx > idx)
					return idx;
			} else {
				trx += lastSqljBlock.getReplaceLength();
				trx += (b.getStartIdx() - lastSqljBlock.getBodyEndIdx() - 1);
				if (trx > idx)
					return b.getStartIdx() - (trx - idx);
			}
			lastSqljBlock = b;
		}
		if (lastSqljBlock == null)
			return idx;
		trx += lastSqljBlock.getReplaceLength();
		return lastSqljBlock.getBodyEndIdx() + (idx - trx) + 1;
	}

	public void compile2Class() throws Exception {
		CompilationUnit unit = createCompilationUnit();
		org.eclipse.jdt.internal.compiler.Compiler compiler = new org.eclipse.jdt.internal.compiler.Compiler(
				new NameEnvironmentImpl(unit),
				DefaultErrorHandlingPolicies.proceedWithAllProblems(),
				new HashMap(), new CompilerRequestorImpl(),
				new DefaultProblemFactory(Locale.getDefault()));
		compiler.compile(new ICompilationUnit[] { new CompilationUnitImpl(unit) });
	}

	private void transform(TypeDeclaration typeDec) throws Exception {
		addDefaultImpl(typeDec);
		final ArrayList<MethodInvocation> list = new ArrayList<MethodInvocation>();
		typeDec.accept(new ASTVisitor() {

			@Override
			public boolean visit(VariableDeclarationStatement node) {
				List<VariableDeclarationFragment> list = node.fragments();
				for (VariableDeclarationFragment vdf : list) {
					parsedSource.registerVariableType(vdf.getName()
							.getIdentifier(), node.getType().toString());
				}
				return super.visit(node);
			}

			public boolean visit(SingleVariableDeclaration svd) {
				parsedSource
						.registerVariableType(svd.getName().getIdentifier(),
								svd.getType().toString());
				return super.visit(svd);
			}

			@Override
			public boolean visit(FieldDeclaration fd) {
				String type = fd.getType().toString();
				List<VariableDeclarationFragment> list = fd.fragments();
				for (VariableDeclarationFragment vdf : list) {
					parsedSource.registerVariableType(vdf.getName()
							.getIdentifier(), type);
				}
				return false;
			}

			@Override
			public boolean visit(MethodInvocation node) {

				if (node.getName().getIdentifier()
						.equals(SqlPosition.METHOD_SQL_EXECUTE)) {
					list.add(node);
				}
				return super.visit(node);
			}

		});
		methodReplace(list);
	}

	private void addDefaultImpl(TypeDeclaration td) {
		AST ast = td.getAST();
		td.superInterfaceTypes().add(
				ast.newSimpleType(ast.newName(IProcedure.class.getName())));

		List<BodyDeclaration> bodys = td.bodyDeclarations();
		FieldDeclaration fd_rs_list = ast
				.newFieldDeclaration(newVariableDeclarationFragment(
						ast,
						rs_list_name,
						newClassInstanceWithType(ast,
								ArrayList.class.getName(),
								ResultSet.class.getSimpleName())));
		fd_rs_list.setType(newParameterizedType(ast, ArrayList.class.getName(),
				ResultSet.class.getSimpleName()));
		bodys.add(fd_rs_list);
		createField(td, Connection.class, conn_name, false);
		createField(td, Object.class, ctx_name, false);

		for (Method m : IProcedure.class.getMethods()) {
			String mName = m.getName();
			if (mName.equals("execute"))
				continue;
			MethodDeclaration md = createFromMethod(ast, m);
			//md.setBody(ast.newBlock());

			if ("cleanUp".equals(mName)) {
				createCleanUpMethod(ast, md);
			} else if ("setConnection".equals(mName)) {
				createSetConnectionMethod(ast, md);
			} else if ("getConnection".equals(mName)) {
				createGetConnectionMethod(ast, md);
			} else if ("setContext".equals(mName)) {
				createSetContextMethod(ast, md);
			} else if ("getContext".equals(mName)) {
				createGetContextMethod(ast, md);
			}
			bodys.add(md);
		}
	}

	private void createField(TypeDeclaration td, Class type, String name,
			boolean init) {
		AST ast = td.getAST();
		FieldDeclaration fd = ast
				.newFieldDeclaration(newVariableDeclarationFragment(ast, name,
						null));
		fd.setType(newSimpleType(ast, type.getName()));
		td.bodyDeclarations().add(fd);
	}

	private MethodDeclaration createFromMethod(AST ast, Method m) {
		MethodDeclaration md = ast.newMethodDeclaration();
		md.setName(ast.newSimpleName(m.getName()));
		if (m.getReturnType() != void.class)
			md.setReturnType2(ast.newSimpleType(ast.newName(m.getReturnType()
					.getName())));
		md.modifiers().addAll(ast.newModifiers(Modifier.PUBLIC));
		for (Class c : m.getExceptionTypes()) {
			md.thrownExceptions().add(ast.newName(c.getName()));
		}
		int i_ = 0;
		for (Class c : m.getParameterTypes()) {
			md.parameters()
					.add(newSingleVariableDeclaration(ast,
							newSimpleType(ast, c.getName()), "args" + i_, null));
		}
		return md;
	}

	private void createCleanUpMethod(AST ast, MethodDeclaration md) {
		String src = String
				.format("for(ResultSet rs:%s){try{if(rs!=null)rs.close();}catch(Exception e){}}",
						rs_list_name);
		Block stmt = createAST(src.toCharArray(), ASTParser.K_STATEMENTS);
		md.setBody((Block) ASTNode.copySubtree(md.getAST(), stmt));
	}

	/**
	 * <i>conn_name</i> = args0;
	 * 
	 * @param ast
	 * @param md
	 */
	private void createSetConnectionMethod(AST ast, MethodDeclaration md) {
		Block block = ast.newBlock();
		Assignment assi = ast.newAssignment();
		assi.setLeftHandSide(ast.newSimpleName(conn_name));
		assi.setRightHandSide(ast.newSimpleName("args0"));
		block.statements().add(ast.newExpressionStatement(assi));
		md.setBody(block);
	}

	/**
	 * return <i>conn_name</i>;
	 * 
	 * @param ast
	 * @param md
	 */
	private void createGetConnectionMethod(AST ast, MethodDeclaration md) {
		ReturnStatement rs = ast.newReturnStatement();
		rs.setExpression(ast.newSimpleName(conn_name));
		Block block = ast.newBlock();
		block.statements().add(rs);
		md.setBody(block);
	}

	/**
	 * <i>ctx_name</i> = args0;
	 * 
	 * @param ast
	 * @param md
	 */
	private void createSetContextMethod(AST ast, MethodDeclaration md) {
		Block block = ast.newBlock();
		Assignment assi = ast.newAssignment();
		assi.setLeftHandSide(ast.newSimpleName(ctx_name));
		assi.setRightHandSide(ast.newSimpleName("args0"));
		block.statements().add(ast.newExpressionStatement(assi));
		md.setBody(block);
	}

	/**
	 * return <i>ctx_name</i>;
	 * 
	 * @param ast
	 * @param md
	 */
	private void createGetContextMethod(AST ast, MethodDeclaration md) {
		ReturnStatement rs = ast.newReturnStatement();
		rs.setExpression(ast.newSimpleName(ctx_name));
		Block block = ast.newBlock();
		block.statements().add(rs);
		md.setBody(block);
	}

	private Statement findStatement(ASTNode n) {
		ASTNode p = n.getParent();
		if (p instanceof Statement)
			return (Statement) p;
		return findStatement(p);
	}

	private void methodReplace(List<MethodInvocation> list) throws Exception {
		for (MethodInvocation mi : list) {
			String rs_id = mi.arguments().get(1).toString();
			Statement s = findStatement(mi);
			List<ASTNode> stmts = (List<ASTNode>) s.getParent()
					.getStructuralProperty(s.getLocationInParent());
			int index = stmts.indexOf(s);
			ArrayList<Statement> gene_stmts = generate__sqlj_execute(mi);
			stmts.addAll(index, gene_stmts);
			index += gene_stmts.size();
			AST ast = mi.getAST();

			StructuralPropertyDescriptor loc = mi.getLocationInParent();
			if (loc.getNodeClass() == EnhancedForStatement.class
					&& "expression".equals(loc.getId())) {
				EnhancedForStatement efs = (EnhancedForStatement) s;
				Expression newExp = createNewResultSetIteratorExpression(ast,
						rs_id, efs.getParameter().getType().toString());
				efs.setExpression(newExp);
				String refType = efs.getParameter().getType().toString();
				if (refType.equals(Map.class.getSimpleName())
						&& refType.endsWith(Map.class.getName())) {
					updateReferenceInFor(efs);
				}
			} else if (loc.getNodeClass() == VariableDeclarationFragment.class
					&& "initializer".equals(loc.getId())) {
				VariableDeclarationStatement vds = (VariableDeclarationStatement) s;
				String src = String.format(
						"DataTransfer.transfer1(%s.class,%s)", vds.getType()
								.toString(), rs_id);
				Expression exp = createAST(src.toCharArray(),
						ASTParser.K_EXPRESSION);
				mi.getParent().setStructuralProperty(loc,
						ASTNode.copySubtree(ast, exp));
			} else if (loc.getNodeClass() == MethodInvocation.class
					&& "arguments".equals(loc.getId())) {
				List<Expression> argslist = ((MethodInvocation) mi.getParent())
						.arguments();
				int idx = argslist.indexOf(mi);
				argslist.set(idx, ast.newSimpleName(rs_id));
			} else if (loc.getNodeClass() == ExpressionStatement.class
					&& "expression".equals(loc.getId())) {
				stmts.remove(index);
			}
		}
	}

	void updateReferenceInFor(EnhancedForStatement efs) {
		SingleVariableDeclaration svd = efs.getParameter();
		final String ref = svd.getName().getIdentifier();
		final HashMap<String, String> columnTypeCache = new HashMap<String, String>();
		efs.getBody().accept(new ASTVisitor() {

			@Override
			public boolean visit(QualifiedName node) {
				if (node.getQualifier().getFullyQualifiedName().equals(ref)) {
					AST ast = node.getAST();
					ASTNode parent = node.getParent();
					StructuralPropertyDescriptor loc = node
							.getLocationInParent();
					String name = node.getName().getIdentifier();
					String type = columnTypeCache.get(name);
					if (type == null) {
						type = guessType(parent);
						columnTypeCache.put(name, type);
					}
					Expression newExp = newMethodInvocation(ast,
							ast.newSimpleName(ResultSetUtil.class
									.getSimpleName()), METHOD_GET, ast
									.newSimpleName(ref),
							newStringLiteral(ast, name),
							newTypeLiteral(ast, type));
					if (loc.isChildProperty()) {
						parent.setStructuralProperty(loc, newExp);
					} else if (loc.isChildListProperty()) {
						List<ASTNode> childList = (List<ASTNode>) parent
								.getStructuralProperty(loc);
						int idx = childList.indexOf(node);
						childList.set(idx, newExp);
					} else
						System.out.println(loc);

				}
				return false;
			}

			@Override
			public boolean visit(VariableDeclarationStatement node) {
				List<VariableDeclarationFragment> list = node.fragments();
				for (VariableDeclarationFragment vdf : list) {
					parsedSource.registerVariableType(vdf.getName().toString(),
							node.getType().toString());
				}
				return super.visit(node);
			}

			public boolean visit(MethodInvocation mi) {
				//update reference in sub sql execution
				if (mi.getName().getIdentifier()
						.equals(SqlPosition.METHOD_SQL_EXECUTE)) {
					int sqlId = Integer.parseInt(mi.arguments().get(0)
							.toString());
					SqljBlock sqljb = parsedSource.getSqlById(sqlId);
					try {
						ParsedSql psql = sqljb.getParsedSql();
						for (Parameter p : psql.getBindParameters()) {
							Expression exp = parseExpression(mi.getAST(),
									p.getExpression());
							if (exp instanceof QualifiedName) {
								QualifiedName qn = (QualifiedName) exp;
								if (qn.getQualifier().getFullyQualifiedName()
										.equals(ref)) {
									p.setExpression(String.format(
											"%s.get(\"%s\")", ref, qn.getName()
													.getIdentifier()));
								}
							}
						}
					} catch (ParserException e) {
						e.printStackTrace();
					}
				}
				return true;
			}
		});
	}

	String guessType(ASTNode parent) {
		while (!(parent instanceof Statement)) {
			if (parent instanceof Assignment) {
				Assignment assi = (Assignment) parent;
				Expression leftHandSide = assi.getLeftHandSide();
				if (!(leftHandSide instanceof SimpleName))
					continue;
				String var = ((SimpleName) leftHandSide).getIdentifier();
				String type = parsedSource.getOriginalVariableType(var);
				if (type != null)
					return type;
				break;
			} else if (parent instanceof VariableDeclarationFragment) {
				VariableDeclarationStatement vds = (VariableDeclarationStatement) parent
						.getParent();
				Type type = vds.getType();
				while (type.isArrayType()) {
					ArrayType atype = (ArrayType) type;
					type = atype.getComponentType();
				}
				return type.toString();
			} else if (parent instanceof MethodInvocation) {
				break;
			}
			parent = parent.getParent();
		}
		return Object.class.getSimpleName();
	}

	ArrayList<Statement> generate__sqlj_execute(MethodInvocation mi)
			throws ParserException {
		List<Expression> params = mi.arguments();
		int sqlid = Integer.parseInt(params.get(0).toString());
		String stmt_name = parsedSource.genId("ps");
		AST ast = mi.getAST();
		SqljBlock sqljblock = parsedSource.getSqlById(sqlid);
		ParsedSql parsedSql = sqljblock.getParsedSql();
		String stmt_type = java.sql.PreparedStatement.class.getSimpleName();
		String prepare_method = METHOD_PREPARE_STATEMENT;
		if (parsedSql.hasOutputParameter()) {
			stmt_type = java.sql.CallableStatement.class.getSimpleName();
			prepare_method = METHOD_PREPARE_CALL;
		}
		ArrayList<Statement> generated_statements = new ArrayList<Statement>();
		Expression sqlExpression = createSqlLiteralStatements(ast, parsedSql,
				generated_statements);
		VariableDeclarationStatement vds = newVariableDeclarationStatement(
				ast,
				stmt_type,
				newVariableDeclarationFragment(
						ast,
						stmt_name,
						newMethodInvocation(
								ast,
								newMethodInvocation(ast, null,
										METHOD_GET_CONNECTION), prepare_method,
								sqlExpression)));
		generated_statements.add(vds);
		//bind parameters
		performParameterBinding(ast, parsedSql, generated_statements, stmt_name);
		//execute
		MethodInvocation mi2 = newMethodInvocation(ast,
				ast.newSimpleName(stmt_name), METHOD_EXECUTE);
		generated_statements.add(ast.newExpressionStatement(mi2));
		//set UPDATE_COUNT flag
		//		Assignment assi = ast.newAssignment();
		//		assi.setLeftHandSide(ast.newSimpleName(UPDATE_COUNT));
		//		assi.setRightHandSide(newMethodInvocation(ast,
		//				ast.newSimpleName(stmt_name), METHOD_GET_UPDATE_COUNT));
		//		generated_statements.add(ast.newExpressionStatement(assi));
		//fetch output parameters
		performParameterFetching(ast, parsedSql, generated_statements,
				stmt_name);
		//set resultset
		String rs_name = params.get(1).toString();
		VariableDeclarationStatement rs_vds = newVariableDeclarationStatement(
				ast,
				java.sql.ResultSet.class.getSimpleName(),
				newVariableDeclarationFragment(
						ast,
						rs_name,
						newMethodInvocation(ast, ast.newSimpleName(stmt_name),
								METHOD_GET_RESULT_SET)));
		generated_statements.add(rs_vds);
		//put rs into list 
		generated_statements.add(ast
				.newExpressionStatement(newMethodInvocation(ast,
						ast.newSimpleName(rs_list_name), "add",
						ast.newSimpleName(rs_name))));
		return generated_statements;
	}

	/**
	 * expression stands for <i>new
	 * ResultSetIterator&lt;typeName&gt;(rs_id,typeName.class)<i>
	 * 
	 * @param ast
	 * @param rs_id
	 * @param typeName
	 * @return
	 */

	Expression createNewResultSetIteratorExpression(AST ast, String rs_id,
			String typeName) {
		return newClassInstanceWithType(ast,
				ResultSetIterator.class.getSimpleName(), typeName,
				ast.newSimpleName(rs_id));
	}

	Expression newClassInstanceWithType(AST ast, String className,
			String typeName, Expression... args) {
		TypeLiteral fa = newTypeLiteral(ast, typeName);
		ClassInstanceCreation cic = ast.newClassInstanceCreation();
		ParameterizedType pt = newParameterizedType(ast, className, typeName);
		cic.setType(pt);
		cic.arguments().addAll(Arrays.asList(args));
		return cic;
	}

	ParameterizedType newParameterizedType(AST ast, String className,
			String typeName) {
		ParameterizedType pt = ast.newParameterizedType(ast.newSimpleType(ast
				.newName(className)));
		pt.typeArguments().add(ast.newSimpleType(ast.newName(typeName)));
		return pt;
	}

	/**
	 * expression stands for the sql literal<br> StringLiteral or
	 * StringBuilder.toString() (if the sql is dynamic)<br> extra statements
	 * will add to <i>list<i>
	 * 
	 * @param ast
	 * @param psql
	 * @param list
	 * @param parsedSource
	 * @return
	 */
	Expression createSqlLiteralStatements(AST ast, ParsedSql psql,
			ArrayList<Statement> list) {
		if (!psql.isDynamic()) {
			return newStringLiteral(ast, psql.getFirstFragment());
		}
		String name = parsedSource.genId("sql");
		VariableDeclarationStatement vds_sb = newVariableDeclarationStatement(
				ast,
				StringBuilder.class.getSimpleName(),
				newVariableDeclarationFragment(
						ast,
						name,
						newClassInstance(ast,
								StringBuilder.class.getSimpleName())));
		list.add(vds_sb);
		List<String> fragments = psql.getFragments();
		List<Parameter> dyParas = psql.getDynamicParameters();
		for (int i = 0; i < fragments.size(); i++) {
			MethodInvocation mi_ = newMethodInvocation(ast, ast.newName(name),
					METHOD_APPEND, newStringLiteral(ast, fragments.get(i)));
			list.add(ast.newExpressionStatement(mi_));
			if (i < dyParas.size()) {

				mi_ = newMethodInvocation(ast, ast.newName(name),
						METHOD_APPEND,
						parseExpression(ast, dyParas.get(i).getExpression()));
				list.add(ast.newExpressionStatement(mi_));
			}
		}
		return newMethodInvocation(ast, ast.newName(name), METHOD_TO_STRING);
	}

	void performParameterBinding(AST ast, ParsedSql psql,
			ArrayList<Statement> list, String stmt_name) {
		int i = 1;
		//parameter binding
		for (Parameter p : psql.getBindParameters()) {
			if (p.getType() == Parameter.OUT) {
				MethodInvocation mi1 = newMethodInvocation(
						ast,
						ast.newSimpleName(stmt_name),
						METHOD_REGISTER_OUT_PARAMETER,
						ast.newNumberLiteral("" + i),
						newQualifiedName(ast, java.sql.Types.class
								.getSimpleName(), parsedSource
								.getVariableSqlType(p.getExpression())));
				list.add(ast.newExpressionStatement(mi1));
			} else {
				MethodInvocation mi1 = newMethodInvocation(
						ast,
						ast.newSimpleName(stmt_name),
						"set"
								+ parsedSource.getVariableType(
										p.getExpression(), "Object"),
						ast.newNumberLiteral("" + i),
						parseExpression(ast, p.getExpression()));
				list.add(ast.newExpressionStatement(mi1));
			}
			i++;
		}
	}

	/**
	 * create an ParenthesizedExpression via a expression string<br> the
	 * expression can be complex.
	 * 
	 * @param ast
	 * @param expr
	 *            complex expression e.g. <u>a.name+'-'+a.address<u>
	 * @return
	 */
	Expression parseExpression(AST ast, String expr) {
		ASTParser parser = ASTParser.newParser(API_LEVEL);
		parser.setKind(ASTParser.K_EXPRESSION);
		parser.setSource(expr.toCharArray());
		AST a = ast.newParenthesizedExpression().getAST();
		return (Expression) ASTNode.copySubtree(a, parser.createAST(null));
	}

	void performParameterFetching(AST ast, ParsedSql psql,
			ArrayList<Statement> list, String stmt_name) {
		int i = 1;
		for (Parameter p : psql.getBindParameters()) {
			if (p.getType() == Parameter.OUT) {
				Assignment assi2 = ast.newAssignment();
				assi2.setLeftHandSide(parseExpression(ast, p.getExpression()));
				assi2.setRightHandSide(newMethodInvocation(
						ast,
						ast.newSimpleName(stmt_name),
						"get" + parsedSource.getVariableType(p.getExpression()),
						ast.newNumberLiteral("" + i)));
				list.add(ast.newExpressionStatement(assi2));
			}
			i++;
		}
	}

	ArrayList<Statement> generate__sqlj_execute_for(MethodInvocation mi) {
		ArrayList<Statement> list = new ArrayList<Statement>();
		list = generate__sqlj_execute_para(mi);
		return list;
	}

	ArrayList<Statement> generate__sqlj_execute_para(MethodInvocation mi) {
		ArrayList<Statement> list = null;
		try {
			list = generate__sqlj_execute(mi);
			ExpressionStatement es = (ExpressionStatement) list
					.get(list.size() - 2);//the last statement is __sqlj_cs_gen2.execute();
			MethodInvocation es_mi = (MethodInvocation) es.getExpression();
			String ps_id = es_mi.getExpression().toString();
			String rs_id = mi.arguments().get(1).toString();
			AST ast = mi.getAST();
			VariableDeclarationStatement vds = newVariableDeclarationStatement(
					ast,
					java.sql.ResultSet.class.getSimpleName(),
					newVariableDeclarationFragment(
							ast,
							rs_id,
							newMethodInvocation(ast, ast.newSimpleName(ps_id),
									METHOD_GET_RESULT_SET)));
			list.add(vds);
		} catch (ParserException e) {
			throw new RuntimeException(e);
		}//new ArrayList<Statement>();
		return list;
	}

	ClassInstanceCreation newClassInstance(AST ast, String className,
			Expression... args) {
		ClassInstanceCreation inst = ast.newClassInstanceCreation();
		inst.setType(ast.newSimpleType(ast.newName(className)));
		inst.arguments().addAll(Arrays.asList(args));
		return inst;
	}

	QualifiedName newQualifiedName(AST ast, String leftPart, String rightPart) {
		return ast.newQualifiedName(ast.newName(leftPart),
				ast.newSimpleName(rightPart));
	}

	VariableDeclarationFragment newVariableDeclarationFragment(AST ast,
			String name, Expression init) {
		VariableDeclarationFragment vdf = ast.newVariableDeclarationFragment();
		vdf.setName(ast.newSimpleName(name));
		vdf.setInitializer(init);
		return vdf;
	}

	VariableDeclarationStatement newVariableDeclarationStatement(AST ast,
			String typeName, VariableDeclarationFragment... vdfs) {
		VariableDeclarationStatement vds = ast
				.newVariableDeclarationStatement(vdfs[0]);
		vds.setType(ast.newSimpleType(ast.newName(typeName)));
		for (int i = 1; i < vdfs.length; i++)
			vds.fragments().add(vdfs[i]);
		return vds;
	}

	SingleVariableDeclaration newSingleVariableDeclaration(AST ast, Type type,
			String name, Expression init) {
		SingleVariableDeclaration svd = ast.newSingleVariableDeclaration();
		svd.setType(type);
		svd.setName(ast.newSimpleName(name));
		if (init != null)
			svd.setInitializer(init);
		return svd;
	}

	MethodInvocation newMethodInvocation(AST ast, Expression exp, String name,
			Expression... args) {
		MethodInvocation mi = ast.newMethodInvocation();
		mi.setExpression(exp);
		mi.setName(ast.newSimpleName(name));
		for (Expression e : args) {
			mi.arguments().add(e);
		}
		return mi;
	}

	TypeLiteral newTypeLiteral(AST ast, String type) {
		TypeLiteral tl = ast.newTypeLiteral();
		if (isPrimitiveType(type))
			tl.setType(ast.newPrimitiveType(PrimitiveType.toCode(type)));
		else {
			tl.setType(ast.newSimpleType(ast.newName(type)));
		}
		return tl;
	}

	Type newSimpleType(AST ast, String type) {
		return ast.newSimpleType(ast.newName(type));
	}

	boolean isPrimitiveType(String type) {
		return Arrays.asList("int", "double", "long", "short", "byte", "char",
				"boolean", "float").contains(type);
	}

	StringLiteral newStringLiteral(AST ast, String value) {
		StringLiteral sl = ast.newStringLiteral();
		sl.setLiteralValue(value);
		return sl;
	}

	public static <T extends ASTNode> T createAST(char[] cs, int kind) {
		long t0 = System.currentTimeMillis();
		ASTParser parser = ASTParser.newParser(API_LEVEL);
		parser.setKind(kind);
		parser.setSource(cs);
		T r = (T) parser.createAST(null);
		System.out.println(System.currentTimeMillis() - t0);
		return r;
	}

	static private class CompilationUnitImpl implements ICompilationUnit {
		private CompilationUnit unit;

		CompilationUnitImpl(CompilationUnit unit) {
			this.unit = unit;
		}

		public char[] getContents() {
			char[] contents = null;
			try {
				Document doc = new Document();
				TextEdit edits = unit.rewrite(doc, null);
				edits.apply(doc);
				String sourceCode = doc.get();
				if (sourceCode != null)
					contents = sourceCode.toCharArray();
			} catch (BadLocationException e) {
				throw new RuntimeException(e);
			}
			return contents;
		}

		public char[] getMainTypeName() {
			TypeDeclaration classType = (TypeDeclaration) unit.types().get(0);
			return classType.getName().getFullyQualifiedName().toCharArray();
		}

		public char[][] getPackageName() {
			String[] names = getSimpleNames(this.unit.getPackage().getName()
					.getFullyQualifiedName());
			char[][] packages = new char[names.length][];
			for (int i = 0; i < names.length; ++i)
				packages[i] = names[i].toCharArray();
			return packages;
		}

		private String[] getSimpleNames(String fullQname) {
			return fullQname.split("\\.");
		}

		public char[] getFileName() {
			String name = new String(getMainTypeName()) + ".java";
			return name.toCharArray();
		}

		@Override
		public boolean ignoreOptionalProblems() {
			return false;
		}
	}

	private static class NameEnvironmentImpl implements INameEnvironment {

		public NameEnvironmentImpl(CompilationUnit unit) {

		}

		@Override
		public NameEnvironmentAnswer findType(char[][] compoundTypeName) {
			// TODO Auto-generated method stub
			return null;
		}

		@Override
		public NameEnvironmentAnswer findType(char[] typeName,
				char[][] packageName) {
			// TODO Auto-generated method stub
			return null;
		}

		@Override
		public boolean isPackage(char[][] parentPackageName, char[] packageName) {
			// TODO Auto-generated method stub
			return false;
		}

		@Override
		public void cleanup() {
			// TODO Auto-generated method stub

		}

	}

	private static class CompilerRequestorImpl implements ICompilerRequestor {

		@Override
		public void acceptResult(CompilationResult result) {
			System.out.println(result);
		}

	}
}
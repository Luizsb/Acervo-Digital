import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Users } from 'lucide-react';
import { isSupabaseBackend } from '../config/backend';
import { apiAdminUsers, type AdminUserItem } from '../utils/api';
import { databaseFailureText } from '../utils/catalogLoadError';
import { formatReportDate, roleLabel, usersToCsv } from '../utils/usersReport';

function downloadCsv(users: AdminUserItem[]) {
  const blob = new Blob([usersToCsv(users)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `usuarios-acervo-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Relatório de usuários e perfis para a revisão periódica de acessos. */
export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiAdminUsers()
      .then((list) => {
        if (!cancelled) setUsers(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setUsers([]);
          setError(databaseFailureText(err, 'Não foi possível listar os usuários.', !isSupabaseBackend()));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const admins = users.filter((user) => user.papel === 'admin').length;

  return (
    <section className="admin-sheet-card">
      <div className="admin-sheet-head">
        <div className="admin-sheet-title">
          <Users size={18} />
          <div>
            <h2>Usuários e perfis</h2>
            <p>
              {loading
                ? 'Carregando usuários...'
                : `${plural(users.length, 'usuário', 'usuários')} · ${plural(admins, 'administrador', 'administradores')}. Cada consulta fica registrada na trilha de auditoria.`}
            </p>
          </div>
        </div>
        <div className="admin-sheet-actions">
          <button
            type="button"
            className="admin-sheet-upload is-ghost"
            disabled={loading}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
          <button
            type="button"
            className="admin-sheet-upload"
            disabled={loading || users.length === 0}
            onClick={() => downloadCsv(users)}
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {error ? <p className="admin-review-error">{error}</p> : null}

      <div className="admin-review-table-wrap">
        <table className="admin-review-table">
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Criado em</th>
              <th>Último acesso</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Carregando usuários...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4}>Nenhum usuário encontrado.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.email}>
                  <td>
                    <strong>{user.email}</strong>
                  </td>
                  <td>{roleLabel(user.papel)}</td>
                  <td>{formatReportDate(user.criadoEm) || '—'}</td>
                  <td>{formatReportDate(user.ultimoAcesso) || 'Nunca'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
